# Email sequence after intake

Three emails, each with an English and an Urdu version. Send from a named case manager's address, not a no-reply address. Plain text works best. Placeholders in double braces are filled by the system or by hand.

Placeholders: `{{FIRST_NAME}}`, `{{CASE_NUMBER}}` (RS-0001 style), `{{CASE_MANAGER}}`, `{{PRODUCT}}`, `{{PAYMENT_LINK}}`, `{{DELIVERY_DATE}}`, `{{MEMO_LINK}}`, `{{SITE_URL}}`.

Rules: no promises, no outcomes, keep the disclaimer in the footer, ask for a reply rather than a click. The referral ask appears only after the memo has been delivered.

Footer for all emails: "Rasta is a navigation and case-management service. We are not a law firm. This is general information, not legal advice. It does not create an advocate-client relationship."

---

## Email 1. Confirmation (send within 1 hour of intake)

**Subject:** We have your request, {{FIRST_NAME}} (case {{CASE_NUMBER}})

**English**

Hello {{FIRST_NAME}},

Thank you for sending your request. Your case number is {{CASE_NUMBER}}. I am {{CASE_MANAGER}}, and I will be your named case manager.

Here is what happens next.

1. I read what you sent. If anything is missing, I will write to you within one working day with a short list.
2. I confirm which product fits your problem and its price, before you pay anything. For reference: a Pathway Question is $15, a 30-minute call is $49, and a Case Assessment is $249.
3. You pay for that one step only, using this link: {{PAYMENT_LINK}}. You get a receipt each time.
4. For a Case Assessment, your Pathway Memo is aimed at delivery within 5 working days of receiving your documents (target {{DELIVERY_DATE}}).

Please do not send passwords, bank details or card numbers by email or WhatsApp. If a document is sensitive, tell me and I will give you a safer way to send it.

I cannot promise a result or a date from any government office or court. I can promise a clear plan and regular updates.

Reply to this email with any questions.

{{CASE_MANAGER}}
Rasta

**اردو**

السلام علیکم {{FIRST_NAME}}،

آپ کی درخواست بھیجنے کا شکریہ۔ آپ کا کیس نمبر {{CASE_NUMBER}} ہے۔ میں {{CASE_MANAGER}} ہوں اور آپ کا مقرر کردہ کیس مینیجر ہوں گا۔

اگلے مراحل یہ ہیں۔

1. میں آپ کی بھیجی ہوئی معلومات پڑھوں گا۔ کچھ کم ہوا تو ایک کام کے دن میں مختصر فہرست کے ساتھ لکھوں گا۔
2. ادائیگی سے پہلے میں بتاؤں گا کہ آپ کے مسئلے کے لیے کون سی پروڈکٹ مناسب ہے اور اس کی قیمت کیا ہے۔ حوالے کے لیے: پاتھ وے سوال 15 ڈالر، 30 منٹ کی کال 49 ڈالر، اور کیس اسیسمنٹ 249 ڈالر ہے۔
3. آپ صرف اسی ایک مرحلے کی ادائیگی کریں گے، اس لنک سے: {{PAYMENT_LINK}}۔ ہر بار رسید ملے گی۔
4. کیس اسیسمنٹ میں آپ کا پاتھ وے میمو کاغذات ملنے کے 5 کام کے دنوں کے اندر دینے کا ہدف ہے (ہدف {{DELIVERY_DATE}})۔

براہ کرم ای میل یا واٹس ایپ پر پاس ورڈ، بینک کی تفصیلات یا کارڈ نمبر نہ بھیجیں۔ کوئی دستاویز حساس ہو تو بتائیں، میں محفوظ طریقہ بتا دوں گا۔

میں کسی سرکاری دفتر یا عدالت کے نتیجے یا تاریخ کا وعدہ نہیں کر سکتا۔ میں واضح پلان اور باقاعدہ اپ ڈیٹس کا وعدہ کر سکتا ہوں۔

کوئی سوال ہو تو اس ای میل کا جواب دیں۔

{{CASE_MANAGER}}
راستہ

---

## Email 2. Memo delivered (send when the memo is released)

**Subject:** Your Pathway Memo is ready (case {{CASE_NUMBER}})

**English**

Hello {{FIRST_NAME}},

Your Pathway Memo for case {{CASE_NUMBER}} is ready: {{MEMO_LINK}}

What is in it:
- What your problem is, in plain English.
- Which office or court owns it.
- Your options, with realistic timelines and costs. Where we do not know, we say so.
- The traps to avoid.
- Your next steps, in order.

Please read it once on your own. Then let us book the 45-minute call to go through it together. Reply with two times that suit you, and your time zone.

A few honest points.

- The memo is general information. It is not legal advice. Where a legal opinion or a court appearance is needed, an independent advocate does that, is retained by you, and bills you directly. I can introduce you to one. You are free to use your own.
- If you want us to go further, the options are a managed case (from $400, plus advocate fees) or errands (from $35, plus government fees). Nothing starts without your written yes.
- If we missed the memo deadline we stated, tell me and we will refund you in full (assumption, TODO: confirm wording).

Thank you for trusting us with this.

{{CASE_MANAGER}}
Rasta

**اردو**

السلام علیکم {{FIRST_NAME}}،

کیس {{CASE_NUMBER}} کا آپ کا پاتھ وے میمو تیار ہے: {{MEMO_LINK}}

اس میں کیا ہے:
- آپ کا مسئلہ سادہ زبان میں۔
- کون سا دفتر یا عدالت ذمہ دار ہے۔
- آپ کے راستے، حقیقت پسندانہ وقت اور خرچ کے ساتھ۔ جہاں ہمیں معلوم نہیں، وہاں ہم یہ لکھتے ہیں۔
- جن غلطیوں سے بچنا ہے۔
- آپ کے اگلے قدم، ترتیب سے۔

براہ کرم پہلے اسے ایک بار خود پڑھ لیں۔ پھر 45 منٹ کی کال بُک کرتے ہیں تاکہ ہم مل کر دیکھیں۔ اپنے ٹائم زون کے ساتھ دو مناسب اوقات لکھ بھیجیں۔

چند صاف باتیں۔

- میمو عمومی معلومات ہے۔ یہ قانونی مشورہ نہیں۔ جہاں قانونی رائے یا عدالت میں پیشی چاہیے، وہاں آزاد وکیل یہ کام کرتا ہے، آپ کا مقرر کردہ ہوتا ہے اور آپ کو براہ راست بل دیتا ہے۔ میں آپ کو کسی سے ملا سکتا ہوں۔ آپ اپنا وکیل بھی رکھ سکتے ہیں۔
- اگر آپ چاہیں کہ ہم آگے بڑھیں تو راستے یہ ہیں: منظم کیس ($400 سے، علاوہ وکیل کی فیس) یا ایرنڈز ($35 سے، علاوہ سرکاری فیس)۔ آپ کی تحریری ہاں کے بغیر کچھ شروع نہیں ہوتا۔
- اگر ہم نے جو مدت بتائی تھی اس میں میمو نہ دیا ہو تو مجھے بتائیں، ہم پوری رقم واپس کریں گے (فرض، TODO: الفاظ کی تصدیق)۔

اس معاملے میں ہم پر بھروسا کرنے کا شکریہ۔

{{CASE_MANAGER}}
راستہ

---

## Email 3. Seven-day follow-up (send 7 days after the memo)

**Subject:** How is it going, {{FIRST_NAME}}? (case {{CASE_NUMBER}})

**English**

Hello {{FIRST_NAME}},

It has been a week since I sent your Pathway Memo. I wanted to check in.

Three quick questions. You can answer in one line each.

1. Did the memo make your next step clear? If not, what is still unclear?
2. Have you started any of the steps? If so, which? If you are stuck, tell me where.
3. Would you recommend Rasta to someone with a similar problem? Yes or no is fine, and a sentence on why helps us improve.

If you would like us to keep helping, these are the options. Prices are on our price sheet.

- Errands, from $35 plus government fees at cost.
- A managed case, from $400 plus advocate fees.
- A monthly Family Affairs plan, from $79 a month. For example, Watch ($79) includes a quarterly land-record check and 2 questions a month.

There is no pressure. Many people only need the memo.

If you know someone who has a problem back home and wants a straight answer, you are welcome to pass on {{SITE_URL}}/start. If they become a customer, tell them to mention your name. We never share your case with anyone.

Thank you,
{{CASE_MANAGER}}
Rasta

**اردو**

السلام علیکم {{FIRST_NAME}}،

آپ کا پاتھ وے میمو بھیجے ایک ہفتہ ہو گیا ہے۔ میں حال پوچھنا چاہتا تھا۔

تین مختصر سوال۔ ہر ایک کا جواب ایک سطر میں دے سکتے ہیں۔

1. کیا میمو سے آپ کا اگلا قدم واضح ہوا؟ اگر نہیں تو کیا بات ابھی واضح نہیں؟
2. کیا آپ نے کوئی قدم اٹھایا ہے؟ اگر ہاں تو کون سا؟ اگر کہیں رکے ہیں تو بتائیں کہاں۔
3. کیا آپ ملتے جلتے مسئلے والے کسی شخص کو "راستہ" تجویز کریں گے؟ ہاں یا نہیں کافی ہے، اور وجہ کا ایک جملہ ہماری بہتری میں مدد دیتا ہے۔

اگر آپ چاہیں کہ ہم مدد جاری رکھیں تو راستے یہ ہیں۔ قیمتیں ہماری فہرست میں ہیں۔

- ایرنڈز، $35 سے، علاوہ سرکاری فیس (اصل قیمت پر)۔
- منظم کیس، $400 سے، علاوہ وکیل کی فیس۔
- ماہانہ فیملی افیئرز پلان، $79 ماہانہ سے۔ مثلاً واچ ($79) میں ہر تین ماہ بعد زمین کے ریکارڈ کی جانچ اور ماہانہ 2 سوال شامل ہیں۔

کوئی دباؤ نہیں۔ بہت سے لوگوں کو صرف میمو چاہیے ہوتا ہے۔

اگر آپ کسی ایسے شخص کو جانتے ہیں جس کا پاکستان میں مسئلہ ہے اور وہ سیدھا جواب چاہتا ہے تو {{SITE_URL}}/start آگے بھیج سکتے ہیں۔ وہ گاہک بنے تو ان سے کہیں آپ کا نام بتائیں۔ ہم آپ کا کیس کسی سے شیئر نہیں کرتے۔

شکریہ،
{{CASE_MANAGER}}
راستہ
