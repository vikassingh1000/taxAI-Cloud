Tax Alert Extraction Service Requirement
Create a Nodejs function that takes tax notification PDF text as input and returns structured JSON with these fields:

Classification: country (US/UK/EU), tax_type (Corporate Tax/VAT/Transfer Pricing/GILTI/etc), priority (CRITICAL/HIGH/MEDIUM/LOW)
Content: title, 2-3 sentence summary, key_changes list, affected_entities list
Interpretation: BP-specific impact, required_actions list, compliance_risk assessment, estimated deadline

Use Claude Sonnet API with structured prompt engineering, include validation 
for the JSON schema, confidence scoring, and error handling. 
The function should be production-ready with logging and able to process both US IRS and UK HMRC tax notifications accurately.