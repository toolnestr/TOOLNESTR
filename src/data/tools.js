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
  { id: 'engineering', name: 'Electrical Engineering', emoji: '⚡' },
  { id: 'automotive', name: 'Automotive', emoji: '🚗' },
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
  { slug: 'temporary-email', title: 'Temporary Email', short: 'Disposable temp email inbox — receive messages instantly.', category: 'developers', emoji: '📧', enabled: true, status: 'live' },

  // ── Electrical Engineering ──
  { slug: 'ohms-law-calculator', title: 'Ohm\'s Law Calculator', short: 'Calculate voltage, current, resistance & power using V=IR.', category: 'engineering', emoji: '⚡', enabled: true, status: 'live' },
  { slug: 'resistor-color-code', title: 'Resistor Color Code Calculator', short: 'Decode 4, 5 and 6 band resistor values & tolerance.', category: 'engineering', emoji: '🌈', enabled: true, status: 'live' },
  { slug: 'voltage-drop-calculator', title: 'Voltage Drop Calculator', short: 'Voltage drop across wires based on material, length & gauge.', category: 'engineering', emoji: '📉', enabled: true, status: 'live' },
  { slug: 'power-calculator', title: 'Power Calculator', short: 'Calculate electrical power from voltage, current & resistance.', category: 'engineering', emoji: '💡', enabled: true, status: 'live' },
  { slug: 'led-resistor-calculator', title: 'LED Resistor Calculator', short: 'Find the right resistor value for any LED circuit.', category: 'engineering', emoji: '🔴', enabled: true, status: 'live' },
  { slug: 'wire-gauge-calculator', title: 'Wire Gauge / AWG Calculator', short: 'Ampacity, resistance & diameter for standard wire gauges.', category: 'engineering', emoji: '🔌', enabled: true, status: 'live' },
  { slug: 'voltage-divider-calculator', title: 'Voltage Divider Calculator', short: 'Calculate output voltage from two resistors in series.', category: 'engineering', emoji: '🔽', enabled: true, status: 'live' },
  { slug: 'three-phase-power-calculator', title: '3-Phase Power Calculator', short: 'kW, kVA & kVAR for three-phase electrical systems.', category: 'engineering', emoji: '🔋', enabled: true, status: 'live' },
  { slug: 'kva-to-kw-calculator', title: 'kVA to kW / Power Factor Calculator', short: 'Convert apparent power to real power with power factor.', category: 'engineering', emoji: '📊', enabled: true, status: 'live' },
  { slug: 'transformer-calculator', title: 'Transformer Calculator', short: 'Turns ratio, voltage & current for ideal transformers.', category: 'engineering', emoji: '🔄', enabled: true, status: 'live' },
  { slug: 'battery-runtime-calculator', title: 'Battery Runtime Calculator', short: 'Estimate device runtime from battery capacity & consumption.', category: 'engineering', emoji: '🔋', enabled: true, status: 'live' },
  { slug: 'capacitor-code-calculator', title: 'Capacitor Code Calculator', short: 'Decode capacitor values from printed codes & markings.', category: 'engineering', emoji: '💾', enabled: true, status: 'live' },
  { slug: 'lc-resonant-frequency-calculator', title: 'LC Resonant Frequency Calculator', short: 'Resonant frequency of LC tank circuits.', category: 'engineering', emoji: '📡', enabled: true, status: 'live' },
  { slug: 'rc-time-constant-calculator', title: 'RC Time Constant Calculator', short: 'RC charge/discharge time constant from R & C values.', category: 'engineering', emoji: '⏱️', enabled: true, status: 'live' },
  { slug: 'star-delta-conversion-calculator', title: 'Star-Delta Conversion Calculator', short: 'Convert between star (Y) and delta (Δ) resistor networks.', category: 'engineering', emoji: '🔺', enabled: true, status: 'live' },
  { slug: 'pcb-trace-width-calculator', title: 'PCB Trace Width Calculator', short: 'Required trace width for a given current & copper weight.', category: 'engineering', emoji: '📐', enabled: true, status: 'live' },
  { slug: 'frequency-converter', title: 'Frequency & Period Converter', short: 'Convert between frequency and period for any waveform.', category: 'engineering', emoji: '〰️', enabled: true, status: 'live' },
  { slug: 'conduit-fill-calculator', title: 'Conduit Fill Calculator', short: 'Calculate conduit fill percentage per NEC guidelines.', category: 'engineering', emoji: '📦', enabled: true, status: 'live' },
  { slug: 'smd-resistor-code-calculator', title: 'SMD Resistor Code Calculator', short: 'Decode 3 and 4 digit SMD resistor codes to ohms.', category: 'engineering', emoji: '🔬', enabled: true, status: 'live' },
  { slug: 'motor-hp-kw-converter', title: 'Motor HP / kW Converter', short: 'Convert between horsepower, kilowatts and amps for motors.', category: 'engineering', emoji: '⚙️', enabled: true, status: 'live' },

  // ── Automotive (EV) ──
  { slug: 'ev-range-calculator', title: 'EV Range Calculator', short: 'Estimate real-world driving range from battery & efficiency.', category: 'automotive', emoji: '📏', enabled: true, status: 'live' },
  { slug: 'ev-charging-time-calculator', title: 'EV Charging Time Calculator', short: 'Charge time from any % to any % at Level 1/2/DC speeds.', category: 'automotive', emoji: '⏱️', enabled: true, status: 'live' },
  { slug: 'ev-charging-cost-calculator', title: 'EV Charging Cost Calculator', short: 'Cost to charge at home vs public stations.', category: 'automotive', emoji: '💰', enabled: true, status: 'live' },
  { slug: 'ev-vs-gas-savings', title: 'EV vs Gas Savings Calculator', short: 'Total cost comparison over years of ownership.', category: 'automotive', emoji: '📊', enabled: true, status: 'live' },
  { slug: 'ev-efficiency-calculator', title: 'EV Efficiency / Mileage Calculator', short: 'mi/kWh, Wh/mi, km/kWh from distance & energy used.', category: 'automotive', emoji: '📉', enabled: true, status: 'live' },
  { slug: 'ev-battery-degradation', title: 'EV Battery Degradation Calculator', short: 'Estimate capacity loss and range fade over time.', category: 'automotive', emoji: '🔋', enabled: true, status: 'live' },
  { slug: 'ev-trip-planner', title: 'EV Trip / Road Trip Planner', short: 'Charge stops, time & cost for long-distance drives.', category: 'automotive', emoji: '🗺️', enabled: true, status: 'live' },
  { slug: 'ev-home-charger-calculator', title: 'Home Charger Install Calculator', short: 'Breaker size, wire gauge & panel load for L1/L2 chargers.', category: 'automotive', emoji: '🔌', enabled: true, status: 'live' },
  { slug: 'ev-payback-calculator', title: 'EV Payback / Break-even Calculator', short: 'Years to recoup the EV price premium from savings.', category: 'automotive', emoji: '🎯', enabled: true, status: 'live' },
  { slug: 'ev-regenerative-braking', title: 'Regenerative Braking Calculator', short: 'Energy recovered from braking based on speed & weight.', category: 'automotive', emoji: '🔄', enabled: true, status: 'live' },
  { slug: 'ev-co2-savings', title: 'EV CO₂ / Carbon Savings Calculator', short: 'Emissions comparison between EV and gas vehicle.', category: 'automotive', emoji: '🌿', enabled: true, status: 'live' },
  { slug: 'ev-towing-range', title: 'EV Towing Range Calculator', short: 'Range reduction when towing a trailer or load.', category: 'automotive', emoji: '🚛', enabled: true, status: 'live' },
  { slug: 'ev-battery-replacement', title: 'EV Battery Replacement Cost Calculator', short: 'Estimate when to replace battery and projected cost.', category: 'automotive', emoji: '🪫', enabled: true, status: 'live' },
  { slug: 'ev-charger-speed', title: 'EV Charger Speed / Power Calculator', short: 'kW delivered, voltage, amps & charge rate for any EVSE.', category: 'automotive', emoji: '⚡', enabled: true, status: 'live' },
  { slug: 'ev-weight-payload', title: 'EV Weight / Payload Calculator', short: 'Curb weight, GVWR, payload & battery weight impact.', category: 'automotive', emoji: '⚖️', enabled: true, status: 'live' },
];

// Helpers used by pages
export const liveTools = tools.filter((t) => t.enabled && t.status === 'live');
export const toolsByCategory = (catId) => tools.filter((t) => t.category === catId);
export const getTool = (slug) => tools.find((t) => t.slug === slug);
