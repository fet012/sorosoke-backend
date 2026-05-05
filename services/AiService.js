const Groq = require('groq-sdk');

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const generateLegalDocument = async (caseData, complaints) => {
  const complainantSummaries = complaints.map((c, i) =>
    `Complainant ${i + 1}: ${c.description} — Date: ${c.incidentDate || 'Unspecified'} — Location: ${c.location || 'Unspecified'}`
  ).join('\n');

  const completion = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: `You are a Nigerian legal document drafter. Generate a formal collective complaint document.

CASE DETAILS:
- Category: ${caseData.category}
- Location: ${caseData.location}
- Number of Complainants: ${complaints.length}
- Description: ${caseData.description}

INDIVIDUAL ACCOUNTS:
${complainantSummaries}

INSTRUCTIONS:
Generate a formal complaint letter addressed to the appropriate Nigerian authority for this case category.
Reference the specific Nigerian laws that apply.
Use formal legal language for the header and demands section.
Keep individual accounts in plain, clear English.
Include a 30-day response deadline.
Do NOT make up facts not provided above.

FORMAT:
1. Document header with case reference
2. Legal preamble with applicable laws
3. Summary of pattern
4. Individual accounts (anonymized)
5. Legal demands
6. Response deadline`
      }
    ],
  });

  return completion.choices[0].message.content;
};

module.exports = { generateLegalDocument };