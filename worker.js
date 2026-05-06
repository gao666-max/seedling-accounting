// worker.js - Cloudflare Worker 代码
// 注意：你需要先在 Cloudflare 环境变量中设置 DEEPSEEK_API_KEY

export default {
    async fetch(request) {
        // 处理CORS预检请求
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
            });
        }

        // 只接受POST请求
        if (request.method !== 'POST') {
            return new Response(JSON.stringify({ success: false, error: '只支持POST请求' }), {
                status: 405,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }

        try {
            const requestData = await request.json();
            const { text, mode } = requestData;
            
            if (!text) {
                return new Response(JSON.stringify({ success: false, error: '请提供待解析的文本' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
                });
            }

            // 根据模式选择不同的System Prompt
            let systemPrompt = '';
            if (mode === 'order') {
                systemPrompt = `你是一个育苗场订单信息提取专家。从用户输入的文本中提取订单信息。

要求：
1. 提取以下字段：姓名、定苗品种、订苗数量、单价(元)、市县村、联系方式、出苗时间、定金(元)
2. 输出格式必须为JSON，结构如下：
{
  "orders": [
    {
      "name": "客户姓名",
      "variety": "品种名称", 
      "quantity": "数量+单位(如800棵)",
      "unitPrice": "单价数字",
      "location": "地点",
      "contact": "手机号",
      "shipTime": "出苗时间",
      "deposit": "定金数字"
    }
  ]
}
3. 如果信息缺失，对应字段填"--"
4. 联系方式必须是11位手机号格式
5. 定金没有则填"0"
6. 单价没有则填"--"`;
            } else {
                systemPrompt = `你是一个育苗场记账助手，从用户输入的文本中提取收支信息。

要求：
1. 日期：提取文本中的日期（格式：月.日 或 年.月.日）
2. 收入列表(incomeList)：每笔收入包含 location(地点/来源)、customer(客户)、variety(品种)、quantityDesc(数量描述)、amount(金额数字)、phone(电话)、giftTrial(是否赠苗/试种，是/否)、unpaid(是否未结，是/否)、remark(备注)
3. 支出列表(expenseList)：每笔支出包含 location(地点)、amount(金额数字)、purpose(用途)、supplier(供应商)、remark(备注)
4. 金额必须提取数字部分，不要带"元"字
5. 输出格式必须是JSON，结构如下：
{
  "date": "解析出的日期",
  "incomeList": [...],
  "expenseList": [...]
}`;
            }

            // 调用DeepSeek API
            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: text }
                    ],
                    temperature: 0.1,
                    response_format: { type: 'json_object' }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`DeepSeek API错误: ${response.status} - ${errorText}`);
            }

            const aiResponse = await response.json();
            const aiContent = aiResponse.choices[0].message.content;
            const parsedData = JSON.parse(aiContent);

            return new Response(JSON.stringify({
                success: true,
                data: parsedData
            }), {
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });

        } catch (error) {
            console.error('解析错误:', error);
            return new Response(JSON.stringify({
                success: false,
                error: error.message || '解析失败'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }
    }
};