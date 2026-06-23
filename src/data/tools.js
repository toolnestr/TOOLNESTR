// ───────────────────────────────────────────────────────────────
// The master list of tools. This single file drives the homepage grid,
// search, and navigation. To add a tool: add an entry here, then create
// its page in src/pages/tools/<slug>.astro.
//
// status: 'live'  → built and clickable
//         'soon'  → shown with a "Soon" badge (not yet clickable)
// enabled: feature flag. In Phase 2.5 the backend can flip this on/off
//          live. For now it's controlled here.
// ───────────────────────────────────────────────────────────────

export const categories = [
  { id: 'everyday', name: 'Everyday', emoji: '🧮' },
  { id: 'health', name: 'Health & Fitness', emoji: '💪' },
  { id: 'finance', name: 'Finance', emoji: '💰' },
  { id: 'math', name: 'Math', emoji: '🔢' },
  { id: 'pdf', name: 'PDF Tools', emoji: '📄' },
  { id: 'creators', name: 'Creators', emoji: '🎨' },
  { id: 'developers', name: 'Developers', emoji: '💻' },
];

export const tools = [
  // ── Everyday & Students ──
  { slug: 'word-counter', title: 'Word & Character Counter', short: 'Count words, characters, sentences & reading time.', category: 'everyday', emoji: '🔤', enabled: true, status: 'live' },
  { slug: 'case-converter', title: 'Case Converter', short: 'UPPERCASE, lowercase, Title Case, Sentence case & more.', category: 'everyday', emoji: '🔠', enabled: true, status: 'live' },
  { slug: 'age-calculator', title: 'Age Calculator', short: 'Your exact age in years, months, weeks and days.', category: 'everyday', emoji: '🎂', enabled: true, status: 'live' },
  { slug: 'date-difference', title: 'Date Difference', short: 'Days, weeks and months between any two dates.', category: 'everyday', emoji: '📅', enabled: true, status: 'live' },
  { slug: 'discount-calculator', title: 'Discount Calculator', short: 'Final price and savings after a percentage off.', category: 'everyday', emoji: '🏷️', enabled: true, status: 'live' },
  { slug: 'percentage-calculator', title: 'Percentage Calculator', short: 'X% of Y, percent of, increase/decrease.', category: 'everyday', emoji: '％', enabled: true, status: 'live' },
  { slug: 'tip-calculator', title: 'Tip Calculator', short: 'Tip amount and split the bill between people.', category: 'everyday', emoji: '💸', enabled: true, status: 'live' },
  { slug: 'roman-numerals', title: 'Roman Numeral Converter', short: 'Convert numbers ↔ Roman numerals.', category: 'everyday', emoji: '🏛️', enabled: true, status: 'live' },
  { slug: 'unit-converter', title: 'Unit Converter', short: 'Length, weight, temperature, speed & volume.', category: 'everyday', emoji: '📏', enabled: true, status: 'live' },
  { slug: 'tax-calculator', title: 'GST / VAT / Tax Calculator', short: 'Add or remove tax at any rate, any currency.', category: 'everyday', emoji: '🧾', enabled: true, status: 'live' },
  { slug: 'emi-calculator', title: 'Loan / EMI Calculator', short: 'Monthly payment, total interest & cost.', category: 'everyday', emoji: '🏦', enabled: false, status: 'live' },
  { slug: 'hours-calculator', title: 'Hours Calculator', short: 'Hours & minutes between two times.', category: 'everyday', emoji: '⏰', enabled: true, status: 'live' },
  { slug: 'time-calculator', title: 'Time Calculator', short: 'Add or subtract hours, minutes & seconds.', category: 'everyday', emoji: '⌛', enabled: true, status: 'live' },
  { slug: 'gpa-calculator', title: 'GPA Calculator', short: 'Grade point average from courses & credits.', category: 'everyday', emoji: '🎓', enabled: true, status: 'live' },
  { slug: 'grade-calculator', title: 'Grade Calculator', short: 'Weighted final grade from your scores.', category: 'everyday', emoji: '📝', enabled: true, status: 'live' },
  { slug: 'german-grade-calculator', title: 'German Grade Calculator', short: 'Convert GPA, %, CGPA to the German 1.0–5.0 scale.', category: 'everyday', emoji: '🇩🇪', enabled: true, status: 'live' },
  { slug: 'cgpa-to-percentage', title: 'CGPA to Percentage Calculator', short: 'Convert CGPA to percentage (CBSE & custom).', category: 'everyday', emoji: '🎓', enabled: true, status: 'live' },
  { slug: 'percentage-to-cgpa', title: 'Percentage to CGPA Calculator', short: 'Convert a percentage back to CGPA.', category: 'everyday', emoji: '🎓', enabled: true, status: 'live' },
  { slug: 'cgpa-to-gpa', title: 'CGPA to GPA Calculator', short: 'Convert CGPA to the US 4.0 GPA scale.', category: 'everyday', emoji: '🎓', enabled: true, status: 'live' },

  // ── Health & Fitness ──
  { slug: 'bmi-calculator', title: 'BMI Calculator', short: 'Body Mass Index from height & weight.', category: 'health', emoji: '⚖️', enabled: true, status: 'live' },
  { slug: 'bmr-calculator', title: 'BMR Calculator', short: 'Calories your body burns at rest.', category: 'health', emoji: '🔥', enabled: true, status: 'live' },
  { slug: 'calorie-calculator', title: 'Calorie Calculator', short: 'Daily calories to maintain, lose or gain.', category: 'health', emoji: '🍎', enabled: true, status: 'live' },
  { slug: 'ideal-weight', title: 'Ideal Weight Calculator', short: 'Healthy weight range for your height.', category: 'health', emoji: '🎯', enabled: true, status: 'live' },
  { slug: 'body-fat', title: 'Body Fat Calculator', short: 'Estimate body fat percentage (US Navy method).', category: 'health', emoji: '📊', enabled: true, status: 'live' },
  { slug: 'pace-calculator', title: 'Pace Calculator', short: 'Running pace, time and distance.', category: 'health', emoji: '🏃', enabled: true, status: 'live' },
  { slug: 'sleep-calculator', title: 'Sleep Calculator', short: 'Best bedtime & wake-up times by sleep cycle.', category: 'health', emoji: '😴', enabled: true, status: 'live' },
  { slug: 'dog-age-calculator', title: 'Dog Age Calculator', short: 'Your dog’s age in human years.', category: 'health', emoji: '🐶', enabled: true, status: 'live' },

  // ── Finance ──
  { slug: 'mortgage-calculator', title: 'Mortgage Calculator', short: 'Monthly home loan payment & total cost.', category: 'finance', emoji: '🏠', enabled: false, status: 'live' },
  { slug: 'compound-interest', title: 'Compound Interest Calculator', short: 'Grow savings with compounding over time.', category: 'finance', emoji: '📈', enabled: true, status: 'live' },
  { slug: 'investment-calculator', title: 'Investment Calculator', short: 'Future value with regular contributions.', category: 'finance', emoji: '💹', enabled: true, status: 'live' },
  { slug: 'inflation-calculator', title: 'Inflation Calculator', short: 'How inflation changes money over time.', category: 'finance', emoji: '🪙', enabled: true, status: 'live' },
  { slug: 'salary-calculator', title: 'Salary Calculator', short: 'Convert hourly, weekly, monthly & yearly pay.', category: 'finance', emoji: '💵', enabled: true, status: 'live' },
  { slug: 'auto-loan', title: 'Auto Loan Calculator', short: 'Car loan monthly payment & total interest.', category: 'finance', emoji: '🚗', enabled: false, status: 'live' },
  { slug: 'profit-margin', title: 'Profit Margin Calculator', short: 'Margin, markup and profit from cost & price.', category: 'finance', emoji: '📊', enabled: true, status: 'live' },
  { slug: 'roas-calculator', title: 'ROAS Calculator', short: 'Return on ad spend and ACoS for campaigns.', category: 'finance', emoji: '📣', enabled: true, status: 'live' },
  { slug: 'break-even', title: 'Break-even Calculator', short: 'Units & revenue needed to break even.', category: 'finance', emoji: '⚖️', enabled: true, status: 'live' },
  { slug: 'retirement-calculator', title: 'Retirement Calculator', short: 'Project your retirement savings.', category: 'finance', emoji: '🏖️', enabled: false, status: 'soon' },

  // ── Math ──
  { slug: 'scientific-calculator', title: 'Scientific Calculator', short: 'Full calculator with trig, log, powers & more.', category: 'math', emoji: '🧮', enabled: true, status: 'live' },
  { slug: 'fraction-calculator', title: 'Fraction Calculator', short: 'Add, subtract, multiply & divide fractions.', category: 'math', emoji: '➗', enabled: true, status: 'live' },
  { slug: 'random-number', title: 'Random Number Generator', short: 'Random numbers in any range.', category: 'math', emoji: '🎲', enabled: true, status: 'live' },
  { slug: 'standard-deviation', title: 'Standard Deviation Calculator', short: 'Mean, variance & standard deviation.', category: 'math', emoji: '📐', enabled: true, status: 'live' },
  { slug: 'triangle-calculator', title: 'Triangle Calculator', short: 'Area, perimeter & angles from 3 sides.', category: 'math', emoji: '📐', enabled: true, status: 'live' },
  { slug: 'average-calculator', title: 'Average Calculator', short: 'Mean, median, mode & range.', category: 'math', emoji: '📊', enabled: true, status: 'live' },

  // ── PDF Tools (run in your browser — files never upload) ──
  { slug: 'merge-pdf', title: 'Merge PDF', short: 'Combine several PDF files into one document.', category: 'pdf', emoji: '📑', enabled: true, status: 'live' },
  { slug: 'jpg-to-pdf', title: 'JPG to PDF', short: 'Turn images (JPG, PNG, WebP) into a PDF.', category: 'pdf', emoji: '🖼️', enabled: true, status: 'live' },
  { slug: 'split-pdf', title: 'Split PDF', short: 'Extract a page range into a new PDF.', category: 'pdf', emoji: '✂️', enabled: true, status: 'live' },
  { slug: 'pdf-to-jpg', title: 'PDF to JPG', short: 'Save each PDF page as an image.', category: 'pdf', emoji: '🏞️', enabled: true, status: 'live' },

  // ── Creators ──
  { slug: 'fancy-text', title: 'Fancy Text Generator', short: 'Turn text into stylish fonts for bios & posts.', category: 'creators', emoji: '✨', enabled: true, status: 'live' },
  { slug: 'hashtag-generator', title: 'Hashtag Generator', short: 'Relevant hashtags for any topic or niche.', category: 'creators', emoji: '#️⃣', enabled: true, status: 'live' },
  { slug: 'emoji-picker', title: 'Emoji & Symbol Picker', short: 'Copy-paste emojis and aesthetic symbols.', category: 'creators', emoji: '😀', enabled: true, status: 'live' },
  { slug: 'text-repeater', title: 'Text Repeater', short: 'Repeat any text or emoji many times.', category: 'creators', emoji: '🔁', enabled: true, status: 'live' },
  { slug: 'love-calculator', title: 'Love Calculator', short: 'Just-for-fun love compatibility score.', category: 'creators', emoji: '💕', enabled: true, status: 'live' },

  // ── Developers ──
  { slug: 'json-formatter', title: 'JSON Formatter', short: 'Format, validate and minify JSON instantly.', category: 'developers', emoji: '🧩', enabled: true, status: 'live' },
  { slug: 'color-converter', title: 'Color Converter', short: 'Convert between HEX, RGB and HSL colors.', category: 'developers', emoji: '🎨', enabled: true, status: 'live' },
  { slug: 'number-base-converter', title: 'Number Base Converter', short: 'Binary, octal, decimal & hex conversions.', category: 'developers', emoji: '🔢', enabled: true, status: 'live' },
  { slug: 'timestamp-converter', title: 'Unix Timestamp Converter', short: 'Epoch ↔ human date, local and UTC.', category: 'developers', emoji: '⏱️', enabled: true, status: 'live' },
  { slug: 'base64', title: 'Base64 Encode / Decode', short: 'Convert text to and from Base64.', category: 'developers', emoji: '🔁', enabled: true, status: 'live' },
  { slug: 'qr-generator', title: 'QR Code Generator', short: 'Make QR codes for links, text and Wi-Fi.', category: 'developers', emoji: '📱', enabled: true, status: 'live' },
  { slug: 'password-generator', title: 'Password Generator', short: 'Create strong, random, secure passwords.', category: 'developers', emoji: '🔒', enabled: true, status: 'live' },
];

// Helpers used by pages
export const liveTools = tools.filter((t) => t.enabled && t.status === 'live');
export const toolsByCategory = (catId) => tools.filter((t) => t.category === catId);
export const getTool = (slug) => tools.find((t) => t.slug === slug);
