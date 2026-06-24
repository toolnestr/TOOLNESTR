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
  { id: 'networking', name: 'Networking & IP Tools', emoji: '🌐' },
  { id: 'everyday', name: 'Everyday', emoji: '🧮' },
  { id: 'health', name: 'Health & Fitness', emoji: '💪' },
  { id: 'finance', name: 'Finance', emoji: '💰' },
  { id: 'math', name: 'Math', emoji: '🔢' },
  { id: 'pdf', name: 'PDF Tools', emoji: '📄' },
  { id: 'creators', name: 'Creators', emoji: '🎨' },
  { id: 'developers', name: 'Developers', emoji: '💻' },
  { id: 'engineering', name: 'Electrical Engineering', emoji: '⚡' },
  { id: 'automotive', name: 'Automotive', emoji: '🚗' },
  { id: 'images', name: 'Image Tools', emoji: '🖼️' },
  { id: 'security', name: 'Security & Hash', emoji: '🔐' },
  { id: 'text', name: 'Text Tools', emoji: '📝' },
  { id: 'seo', name: 'SEO Tools', emoji: '🔍' },
  { id: 'converters', name: 'Converters', emoji: '🔄' },
  { id: 'time-date', name: 'Time & Date', emoji: '🕐' },
  { id: 'charts', name: 'Chart Generators', emoji: '📊' },
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

  // ── Networking & IP Tools ──
  { slug: 'ip-tracker', title: 'IP Address Tracker', short: 'Trace any IP address — location, ISP, ASN and timezone.', category: 'networking', emoji: '🌐', enabled: true, status: 'live' },
  { slug: 'what-is-my-ip', title: 'What Is My IP Address', short: 'See your public IP, location, ISP and browser info instantly.', category: 'networking', emoji: '🌐', enabled: true, status: 'live' },
  { slug: 'subnet-calculator', title: 'IPv4 Subnet Calculator', short: 'Calculate subnet masks, network ranges and host counts.', category: 'networking', emoji: '🔢', enabled: true, status: 'live' },
  { slug: 'cidr-calculator', title: 'CIDR / IP Range Calculator', short: 'Calculate CIDR notation, IP ranges and prefix lengths.', category: 'networking', emoji: '📐', enabled: true, status: 'live' },
  { slug: 'ipv4-to-ipv6-converter', title: 'IPv4 to IPv6 Converter', short: 'Convert IPv4 addresses to IPv6 mapped equivalents.', category: 'networking', emoji: '🔄', enabled: true, status: 'live' },
  { slug: 'ip-binary-hex-converter', title: 'IP to Binary/Hex/Decimal Converter', short: 'Convert IP addresses between decimal, binary and hex formats.', category: 'networking', emoji: '🔢', enabled: true, status: 'live' },
  { slug: 'private-public-ip-checker', title: 'Private vs Public IP Checker', short: 'Check if an IP is private (RFC 1918) or public.', category: 'networking', emoji: '🔒', enabled: true, status: 'live' },
  { slug: 'mac-address-lookup', title: 'MAC Address Lookup (OUI/Vendor)', short: 'Identify the manufacturer of any MAC address.', category: 'networking', emoji: '🏭', enabled: true, status: 'live' },
  { slug: 'dns-lookup', title: 'DNS Lookup Tool', short: 'Look up A, AAAA, MX, TXT, NS and CNAME records.', category: 'networking', emoji: '🔍', enabled: true, status: 'live' },
  { slug: 'reverse-dns-lookup', title: 'Reverse DNS Lookup', short: 'Find the domain name associated with an IP address.', category: 'networking', emoji: '🔎', enabled: true, status: 'live' },
  { slug: 'whois-lookup', title: 'WHOIS Lookup', short: 'Look up domain registration and IP ownership data.', category: 'networking', emoji: '📋', enabled: true, status: 'live' },
  { slug: 'dns-propagation-checker', title: 'DNS Propagation Checker', short: 'Check DNS record propagation across global resolvers.', category: 'networking', emoji: '🌍', enabled: true, status: 'live' },
  { slug: 'blacklist-checker', title: 'Blacklist / DNSBL Checker', short: 'Check if an IP is blacklisted on public RBL zones.', category: 'networking', emoji: '🚫', enabled: true, status: 'live' },
  { slug: 'http-headers-checker', title: 'HTTP Headers Checker', short: 'Inspect HTTP response headers of any URL.', category: 'networking', emoji: '📑', enabled: true, status: 'live' },
  { slug: 'user-agent-parser', title: 'User Agent Parser', short: 'Parse and analyze browser user agent strings.', category: 'networking', emoji: '🖥️', enabled: true, status: 'live' },
  { slug: 'asn-lookup', title: 'ASN Lookup', short: 'Find the ASN and network owner for any IP address.', category: 'networking', emoji: '🏢', enabled: true, status: 'live' },
  { slug: 'ping-latency-test', title: 'HTTP Latency / Ping Test', short: 'Test HTTP round-trip latency to multiple endpoints.', category: 'networking', emoji: '📡', enabled: true, status: 'live' },
  { slug: 'port-checker', title: 'Port Checker', short: 'Check reachability of common ports on any host.', category: 'networking', emoji: '🔌', enabled: true, status: 'live' },
  { slug: 'email-header-analyzer', title: 'Email Header Analyzer', short: 'Parse email headers to trace route and delays.', category: 'networking', emoji: '📧', enabled: true, status: 'live' },
  { slug: 'ip-distance-calculator', title: 'IP Geolocation Distance Calculator', short: 'Calculate the distance between two IP locations.', category: 'networking', emoji: '📏', enabled: true, status: 'live' },

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

  // ── Image Tools ──
  { slug: 'image-resizer', title: 'Image Resizer', short: 'Resize any image by dimensions or percentage — in your browser.', category: 'images', emoji: '📐', enabled: true, status: 'live' },
  { slug: 'image-compressor', title: 'Image Compressor', short: 'Reduce image file size with adjustable quality — 100% private.', category: 'images', emoji: '🗜️', enabled: true, status: 'live' },
  { slug: 'image-cropper', title: 'Image Cropper', short: 'Crop any image with a drag-select area — no upload needed.', category: 'images', emoji: '✂️', enabled: true, status: 'live' },
  { slug: 'image-to-png', title: 'Image to PNG', short: 'Convert JPG, WebP, AVIF and other formats to PNG instantly.', category: 'images', emoji: '🔲', enabled: true, status: 'live' },
  { slug: 'image-to-jpg', title: 'Image to JPG', short: 'Convert any image to JPEG with adjustable quality.', category: 'images', emoji: '🖼️', enabled: true, status: 'live' },
  { slug: 'image-to-webp', title: 'Image to WebP', short: 'Convert images to modern WebP format — smaller & faster.', category: 'images', emoji: '🌐', enabled: true, status: 'live' },
  { slug: 'image-to-avif', title: 'Image to AVIF', short: 'Convert images to next-gen AVIF format for best compression.', category: 'images', emoji: '✨', enabled: true, status: 'live' },
  { slug: 'image-to-base64', title: 'Image to Base64', short: 'Encode any image as a Base64 data URI string.', category: 'images', emoji: '🔣', enabled: true, status: 'live' },
  { slug: 'image-rotator', title: 'Image Rotator', short: 'Rotate images by 90°, 180°, 270° or any custom angle.', category: 'images', emoji: '🔄', enabled: true, status: 'live' },
  { slug: 'image-flip', title: 'Image Mirror / Flip', short: 'Flip images horizontally or vertically with one click.', category: 'images', emoji: '🪞', enabled: true, status: 'live' },

  // ── Security & Hash ──
  { slug: 'md5-hash-generator', title: 'MD5 Hash Generator', short: 'Generate MD5 hashes for any text or string input.', category: 'security', emoji: '🔑', enabled: true, status: 'live' },
  { slug: 'sha256-hash-generator', title: 'SHA-256 Hash Generator', short: 'Generate SHA-256 hashes for any text or string input.', category: 'security', emoji: '🔒', enabled: true, status: 'live' },
  { slug: 'hmac-generator', title: 'HMAC Generator', short: 'Generate keyed-hash message authentication codes with any algorithm.', category: 'security', emoji: '🔐', enabled: true, status: 'live' },
  { slug: 'uuid-generator', title: 'UUID / GUID Generator', short: 'Generate random v4 UUIDs — one or many at once.', category: 'security', emoji: '🆔', enabled: true, status: 'live' },
  { slug: 'password-strength-tester', title: 'Password Strength Tester', short: 'Test your password strength, crack time & character analysis.', category: 'security', emoji: '💪', enabled: true, status: 'live' },
  { slug: 'random-token-generator', title: 'Random Token Generator', short: 'Generate secure random tokens with custom length & charset.', category: 'security', emoji: '🎲', enabled: true, status: 'live' },
  { slug: 'crc32-checksum', title: 'CRC32 Checksum Calculator', short: 'Calculate CRC32 checksums for text or file integrity verification.', category: 'security', emoji: '✅', enabled: true, status: 'live' },

  // ── Text Tools ──
  { slug: 'lorem-ipsum-generator', title: 'Lorem Ipsum Generator', short: 'Generate placeholder text in various lengths and formats.', category: 'text', emoji: '📜', enabled: true, status: 'live' },
  { slug: 'text-reverser', title: 'Text Reverser', short: 'Reverse text, reverse words or reverse sentences instantly.', category: 'text', emoji: '↩️', enabled: true, status: 'live' },
  { slug: 'text-diff-checker', title: 'Text Diff Checker', short: 'Compare two texts and highlight the differences side-by-side.', category: 'text', emoji: '🔍', enabled: true, status: 'live' },
  { slug: 'text-cleaner', title: 'Text Cleaner / Formatter', short: 'Remove extra spaces, blank lines and special characters.', category: 'text', emoji: '🧹', enabled: true, status: 'live' },
  { slug: 'upside-down-text', title: 'Upside Down Text', short: 'Flip text upside down using unicode characters.', category: 'text', emoji: '🙃', enabled: true, status: 'live' },
  { slug: 'strikethrough-generator', title: 'Strikethrough Text Generator', short: 'Convert text to strikethrough, glitch and zalgo styles.', category: 'text', emoji: '̶', enabled: true, status: 'live' },
  { slug: 'syllable-counter', title: 'Syllable Counter', short: 'Count syllables in any English text or word.', category: 'text', emoji: '🔤', enabled: true, status: 'live' },
  { slug: 'reading-time-calculator', title: 'Reading Time Calculator', short: 'Estimate reading time and speaking time for any text.', category: 'text', emoji: '📖', enabled: true, status: 'live' },
  { slug: 'palindrome-checker', title: 'Palindrome Checker', short: 'Check if any text reads the same forwards and backwards.', category: 'text', emoji: '🔄', enabled: true, status: 'live' },
  { slug: 'small-text-generator', title: 'Small Text Generator', short: 'Convert text to subscript, superscript and small caps.', category: 'text', emoji: 'ₓ', enabled: true, status: 'live' },

  // ── SEO Tools ──
  { slug: 'keyword-density-checker', title: 'Keyword Density Checker', short: 'Analyze keyword frequency and density in any text.', category: 'seo', emoji: '📊', enabled: true, status: 'live' },
  { slug: 'keyword-cloud-generator', title: 'Keyword Cloud Generator', short: 'Generate a visual word cloud from any text.', category: 'seo', emoji: '☁️', enabled: true, status: 'live' },
  { slug: 'meta-tag-analyzer', title: 'Meta Tag Analyzer', short: 'Extract and analyze meta tags from pasted HTML source.', category: 'seo', emoji: '🏷️', enabled: true, status: 'live' },
  { slug: 'robots-txt-generator', title: 'Robots.txt Generator', short: 'Generate robots.txt files from simple settings.', category: 'seo', emoji: '🤖', enabled: true, status: 'live' },
  { slug: 'html-sitemap-generator', title: 'HTML Sitemap Generator', short: 'Generate XML sitemap from a list of URLs.', category: 'seo', emoji: '🗺️', enabled: true, status: 'live' },
  { slug: 'html-tag-inspector', title: 'HTML Tag Inspector', short: 'Count and analyze H1-H6, img alt, links in pasted HTML.', category: 'seo', emoji: '🔬', enabled: true, status: 'live' },
  { slug: 'url-cleaner', title: 'URL Cleaner / Parameter Stripper', short: 'Remove tracking parameters from any URL.', category: 'seo', emoji: '🧹', enabled: true, status: 'live' },
  { slug: 'readability-checker', title: 'Text Readability Checker', short: 'Flesch-Kincaid, Gunning Fog & SMOG readability scores.', category: 'seo', emoji: '📖', enabled: true, status: 'live' },
  { slug: 'keyword-extractor', title: 'Keyword Extractor', short: 'Extract most frequent words and phrases from text.', category: 'seo', emoji: '🎯', enabled: true, status: 'live' },
  { slug: 'heading-hierarchy-checker', title: 'Heading Hierarchy Checker', short: 'Validate H1 to H6 heading structure from pasted HTML.', category: 'seo', emoji: '📐', enabled: true, status: 'live' },
  { slug: 'seo-analyzer', title: 'SEO Analyzer', short: 'Full-page SEO audit — content, technical, performance & accessibility scores.', category: 'seo', emoji: '🔬', enabled: true, status: 'live' },

  // ── Converters ──
  { slug: 'csv-to-json', title: 'CSV ↔ JSON Converter', short: 'Convert CSV data to JSON and back — bidirectional.', category: 'converters', emoji: '📊', enabled: true, status: 'live' },
  { slug: 'json-to-yaml', title: 'JSON ↔ YAML Converter', short: 'Convert between JSON and YAML formats instantly.', category: 'converters', emoji: '📄', enabled: true, status: 'live' },
  { slug: 'json-to-xml', title: 'JSON ↔ XML Converter', short: 'Convert between JSON and XML formats bidirectionally.', category: 'converters', emoji: '🔀', enabled: true, status: 'live' },
  { slug: 'text-to-binary', title: 'Text ↔ Binary Converter', short: 'Convert text to binary and binary back to text.', category: 'converters', emoji: '💿', enabled: true, status: 'live' },
  { slug: 'text-to-hex', title: 'Text ↔ Hex Converter', short: 'Convert text to hexadecimal and hex back to text.', category: 'converters', emoji: '🔢', enabled: true, status: 'live' },
  { slug: 'url-encoder-decoder', title: 'URL Encoder / Decoder', short: 'Encode or decode URLs and query parameters.', category: 'converters', emoji: '🔗', enabled: true, status: 'live' },
  { slug: 'html-entity-converter', title: 'HTML Entity Converter', short: 'Encode or decode HTML entities in any text.', category: 'converters', emoji: '🏷️', enabled: true, status: 'live' },
  { slug: 'morse-code-converter', title: 'Morse Code Converter', short: 'Convert text to Morse code and Morse code to text.', category: 'converters', emoji: '📡', enabled: true, status: 'live' },
  { slug: 'ascii-code-converter', title: 'ASCII Code Converter', short: 'Convert characters to ASCII codes and back.', category: 'converters', emoji: '💻', enabled: true, status: 'live' },
  { slug: 'regex-escaper', title: 'Regex Escaper / Unescaper', short: 'Escape or unescape special regex characters.', category: 'converters', emoji: '🔤', enabled: true, status: 'live' },

  // ── Time & Date ──
  { slug: 'world-clock', title: 'World Clock', short: 'Current time in multiple cities and timezones around the world.', category: 'time-date', emoji: '🌐', enabled: true, status: 'live' },
  { slug: 'time-zone-converter', title: 'Time Zone Converter', short: 'Convert a date and time from one timezone to another.', category: 'time-date', emoji: '🌍', enabled: true, status: 'live' },
  { slug: 'countdown-timer', title: 'Countdown Timer', short: 'Count down days, hours, minutes & seconds to any target date.', category: 'time-date', emoji: '⏳', enabled: true, status: 'live' },
  { slug: 'stopwatch', title: 'Stopwatch', short: 'Precision stopwatch with lap time and split time recording.', category: 'time-date', emoji: '⏱️', enabled: true, status: 'live' },
  { slug: 'week-number-calculator', title: 'Week Number Calculator', short: 'Find the ISO week number for any date.', category: 'time-date', emoji: '📅', enabled: true, status: 'live' },
  { slug: 'day-of-year-calculator', title: 'Day of Year Calculator', short: 'Day number, week number and days remaining in the year.', category: 'time-date', emoji: '🗓️', enabled: true, status: 'live' },
  { slug: 'work-hours-calculator', title: 'Work Hours Calculator', short: 'Calculate total work hours between start and end times with breaks.', category: 'time-date', emoji: '💼', enabled: true, status: 'live' },
  { slug: 'meeting-time-planner', title: 'Meeting Time Planner', short: 'Find overlapping available times across multiple timezones.', category: 'time-date', emoji: '🤝', enabled: true, status: 'live' },
  { slug: 'business-days-calculator', title: 'Business Days Calculator', short: 'Add or subtract business days from any date.', category: 'time-date', emoji: '📆', enabled: true, status: 'live' },
  { slug: 'age-in-seconds', title: 'Age in Seconds Calculator', short: 'Your exact age in seconds, minutes, hours, days and more.', category: 'time-date', emoji: '⏰', enabled: true, status: 'live' },

  // ── Chart Generators ──
  { slug: 'bar-chart-generator', title: 'Bar Chart Generator', short: 'Create vertical bar charts from labels and values.', category: 'charts', emoji: '📊', enabled: true, status: 'live' },
  { slug: 'pie-chart-generator', title: 'Pie Chart Generator', short: 'Create proportional pie charts from your data.', category: 'charts', emoji: '🥧', enabled: true, status: 'live' },
  { slug: 'line-chart-generator', title: 'Line Chart Generator', short: 'Create line charts from XY data points.', category: 'charts', emoji: '📈', enabled: true, status: 'live' },
  { slug: 'grouped-bar-chart', title: 'Grouped Bar Chart Generator', short: 'Compare multiple datasets side-by-side with grouped bars.', category: 'charts', emoji: '📊', enabled: true, status: 'live' },
  { slug: 'donut-chart-generator', title: 'Donut Chart Generator', short: 'Create donut charts with percentage labels.', category: 'charts', emoji: '🍩', enabled: true, status: 'live' },
  { slug: 'histogram-generator', title: 'Histogram Generator', short: 'Create frequency distribution histograms from raw data.', category: 'charts', emoji: '📶', enabled: true, status: 'live' },
  { slug: 'gauge-chart', title: 'Gauge / Speedometer Chart', short: 'Create a radial gauge chart for single value display.', category: 'charts', emoji: '🎯', enabled: true, status: 'live' },
  { slug: 'percentage-bar-chart', title: 'Percentage Bar Chart', short: 'Create 100% stacked bar charts showing composition.', category: 'charts', emoji: '📊', enabled: true, status: 'live' },
];

// Helpers used by pages
export const liveTools = tools.filter((t) => t.enabled && t.status === 'live');
export const toolsByCategory = (catId) => tools.filter((t) => t.category === catId);
export const getTool = (slug) => tools.find((t) => t.slug === slug);
