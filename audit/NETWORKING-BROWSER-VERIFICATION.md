# Networking Tools — Browser Verification Checklist

**Purpose:** manually confirm every networking tool renders correct results in a real
browser. Logic + live-API + deployed-code were already verified programmatically; this
sheet closes the remaining "clicked the button and saw it on screen" gap.

**How to use**
- Live site: open `https://toolnestr.com/tools/<slug>/` (each row has the slug).
- Or local: `npm run dev` → `http://localhost:4321/tools/<slug>`.
- For each tool: enter the **Test input**, trigger it, and compare to **Expected**.
- Tick the box if it matches. If not, note what showed instead.
- API tools need internet; results depend on live third-party data (IP/DNS can change
  slightly over time — check the *shape* of the answer, not exact bytes).

**Legend:** 🐛 = a real bug that was fixed (worth checking first). ℹ️ = known limitation, not a bug.

---

## API-backed tools (call the Cloudflare Worker `toolnestr.toolnestr.workers.dev`)

### [ ] 1. IP Address Tracker — `ip-tracker`
- **Input:** `8.8.8.8` → Track
- **Expected:** Country United States (🇺🇸), City Ashburn, Region Virginia, ISP/Org Google, ASN 15169, timezone America/New_York; map pin renders.
- ℹ️ Geolocation is approximate (city-level); provider data can vary.

### [ ] 2. What Is My IP Address — `what-is-my-ip`
- **Input:** loads automatically on open
- **Expected:** your public IP, ISP, city/region/country, and **Latitude / Longitude populated** (not "—").
- 🐛 Lat/Long used to always show "—".

### [ ] 3. DNS Lookup Tool — `dns-lookup`
- **Input:** `google.com`, type `TXT` → Lookup. Also try type `A` and `MX`.
- **Expected (TXT):** rows appear (not "No records found"), including `v=spf1 include:_spf.google.com ~all`; Type column shows `TXT` (not a number); no wrapping quotes.
- **Expected (A):** several IPv4 addresses. **(MX):** `10 smtp.google.com.` etc.
- 🐛 Previously said "No records found" for **every** domain/type.

### [ ] 4. Reverse DNS Lookup — `reverse-dns-lookup`
- **Input:** `8.8.8.8` → Lookup (also `1.1.1.1`)
- **Expected:** Hostname **`dns.google`** (for 1.1.1.1 → `one.one.one.one`); small "Query: 8.8.8.8.in-addr.arpa" caption below.
- 🐛 Previously showed the `.in-addr.arpa` query string instead of the hostname.

### [ ] 5. WHOIS Lookup — `whois-lookup`
- **Input:** `google.com`
- **Expected:** Registrar **MarkMonitor Inc.** (not N/A), Created 1997-09-15, Expiry 2028-09-14, Nameservers NS1–NS4.GOOGLE.COM.
- 🐛 Registrar used to always show "N/A".

### [ ] 6. DNS Propagation Checker — `dns-propagation-checker`
- **Input:** `google.com`, type `A`
- **Expected:** Cloudflare / Google / AdGuard rows each show **Propagated** with real IP lists. Try a domain with no such record (e.g. type `CAA` on a bare domain) → shows **Pending**, not a false Propagated.
- 🐛 Previously always said "Propagated" with a blank IP list.

### [ ] 7. Blacklist / DNSBL Checker — `blacklist-checker`
- **Input:** `8.8.8.8`
- **Expected:** three rows (Spamhaus ZEN / Spamcop / Barracuda). A clean IP shows **Clean**; if Spamhaus is rate-limited it shows **Unknown** with a note — **never a blanket false "Clean"**.
- 🐛 Previously every row always showed "Clean" regardless of real status.

### [ ] 8. HTTP Headers Checker — `http-headers-checker`
- **Input:** click **Fetch Headers**
- **Expected:** a table of your browser's request headers (user-agent, accept, cf-* etc.). Copy All works.

### [ ] 9. ASN Lookup — `asn-lookup`
- **Input:** `8.8.8.8`
- **Expected:** ASN **AS15169**, Org Google, Country present. (No empty "CIDR / Registry / Date Allocated" rows — those were removed.)
- 🐛 Country was dropped; phantom always-empty fields removed.

### [ ] 10. Port Checker — `port-checker`
- **Input:** host `google.com`, port `443` (then `80`)
- **Expected:** **Reachable**, shows HTTP status + ms. Entering port `22` → clear message that only 80/443 can be checked (browser/Worker limitation), not a crash.

### [ ] 11. IP Geolocation Distance Calculator — `ip-distance-calculator`
- **Input:** IP 1 `8.8.8.8`, IP 2 `1.1.1.1`
- **Expected:** a distance in **km and miles** plus each IP's city/country/coords. Must NOT error "Could not determine coordinates."
- 🐛 Previously always errored on coordinates (never worked).

### [ ] 12. Redirect Chain Checker — `redirect-chain-checker`
- **Input:** `http://github.com` (or any http:// URL that redirects to https)
- **Expected:** each hop lists URL, status (301/302/200…) **and a response time in ms** (the ms column was blank before).
- 🐛 Per-hop timing was empty.

### [ ] 13. Website Uptime / Is It Down — `uptime-checker`
- **Input:** `https://google.com` (then a fake domain)
- **Expected:** **Up**, HTTP 200, response time in ms. A non-existent domain → **Down**.
- 🐛 Previously always showed "Down" and N/A even for live sites.

### [ ] 14. SPF Record Checker — `spf-checker`
- **Input:** `google.com`
- **Expected:** finds the record `v=spf1 include:_spf.google.com ~all`, shows parsed mechanisms and DNS-lookup count. Must NOT say "No SPF record".
- 🐛 Quote-wrapping made it report "No SPF record" for domains that have one.

### [ ] 15. DMARC Record Checker — `dmarc-checker`
- **Input:** `google.com`
- **Expected:** finds `v=DMARC1; p=reject; rua=mailto:...`, parses policy. Must NOT say "No DMARC record".
- 🐛 Same quote-wrapping bug as SPF.

### [ ] 16. SSL/TLS Certificate Checker — `ssl-certificate-checker`
- **Input:** `google.com`
- **Expected:** Issuer (Google Trust Services), Valid From/Until, Days Until Expiry, serial. 
- ℹ️ First check of a never-scanned domain can take 60–90s (SSL Labs) and may say "scan started, try again shortly" — that's expected, not a bug.

### [ ] 17. Domain Health Dashboard — `domain-health-dashboard`
- **Input:** `google.com`
- **Expected:** overall score + cards for DNS (A/MX/NS), Email (SPF+DMARC), SSL grade, Uptime, Blacklist, Name Servers. 
- **Check specifically:** if a DNSBL is rate-limited, the Blacklist pill reads **"N/M clean" in amber**, not a falsely confident "✓ Clean".
- 🐛 Pill used to overstate confidence.

---

## Client-side tools (pure in-browser JS — no network)

### [ ] 18. IPv4 Subnet Calculator — `subnet-calculator`
- **Input:** IP `192.168.1.130`, prefix `26`
- **Expected:** Network `192.168.1.128`, Broadcast `192.168.1.191`, Mask `255.255.255.192`, Wildcard `0.0.0.63`, Usable hosts `62`, Range `.129 – .190`.

### [ ] 19. CIDR / IP Range Calculator — `cidr-calculator`
- **Input:** `192.168.1.0/24`
- **Expected:** Network `192.168.1.0`, Broadcast `192.168.1.255`, Total `256`; IP list preview (first/last 10).

### [ ] 20. IPv4 to IPv6 Converter — `ipv4-to-ipv6-converter`
- **Input:** `192.168.1.1`
- **Expected:** Mapped `::ffff:192.168.1.1`, 6to4 `2002:c0a8:0101::1`, hex `0xc0a80101`, binary shown.

### [ ] 21. IP to Binary/Hex/Decimal — `ip-binary-hex-converter`
- **Input:** decimal `192.168.1.1`
- **Expected:** Binary `11000000.10101000.00000001.00000001`, Hex `C0.A8.01.01`, Integer `3,232,235,777`, Class `C`. Try entering the binary or hex → decimal round-trips.

### [ ] 22. Private vs Public IP Checker — `private-public-ip-checker`
- **Input:** `192.168.1.1` → **Private (RFC 1918)**; `8.8.8.8` → **Public**; `127.0.0.1` → Loopback; `169.254.1.1` → Link-Local; `100.64.0.1` → CGNAT.

### [ ] 23. IPv6 Subnet Calculator — `ipv6-subnet-calculator`
- **Input:** `2001:db8::/32`
- **Expected:** Network `2001:db8::`, prefix `/32`, count **65,536 /64 subnets**; boundary rows for /48, /56, /64.

### [ ] 24. IPv6 Compressor / Expander — `ipv6-compressor-expander`
- **Input:** `2001:0db8:0000:0000:0000:0000:0000:0001`
- **Expected:** Compressed `2001:db8::1`; Expanded shows all 8 groups. Enter `::1` → expands to `0000:...:0001`. Enter `2001:db8::` → compressed stays `2001:db8::`.

### [ ] 25. Bandwidth / Download Time — `bandwidth-calculator`
- **Input:** file size `1` GB, speed `100` Mbps
- **Expected:** ~`1 min 26 sec` (≈85.9s). Comparison table lists 25/50/100/500 Mbps, 1 Gbps.

### [ ] 26. MTU Calculator — `mtu-calculator`
- **Input:** MTU `1500`, encapsulation `PPPoE`
- **Expected:** Payload `1492 bytes`, 8 bytes overhead. Overhead table: None 1500, VLAN 1496, GRE 1476, IPsec 1446.

### [ ] 27. Bandwidth vs Throughput — `bandwidth-vs-throughput-calculator`
- **Input:** bandwidth `100` Mbps, overhead `5`%, RTT `50` ms, window `64` KB
- **Expected:** TCP max throughput ≈ `10.5 Mbps` (window-limited), BDP ≈ `625 KB`; note that window < BDP → "window-limited".

### [ ] 28. IP List Sorter & Deduplicator — `ip-list-sorter`
- **Input:** paste (one per line): `192.168.1.10`, `8.8.8.8`, `192.168.1.2`, `8.8.8.8`, `10.0.0.5`
- **Expected:** Sort → numeric order `8.8.8.8, 10.0.0.5, 192.168.1.2, 192.168.1.10` with the duplicate 8.8.8.8 removed; stats show total 5 / unique 4. "Public only" and "Private only" filters work.

### [ ] 29. DNS Record Builder — `dns-record-builder`
- **Input:** type `A`, name `www.example.com`, value `192.0.2.1`, TTL `3600`
- **Expected:** `www.example.com. 3600 IN A 192.0.2.1`. Try MX / TXT / SPF / DKIM → each emits valid zone syntax.

### [ ] 30. HTTP Latency / Ping Test — `ping-latency-test`
- **Input:** click **Start Test**
- **Expected:** 4 endpoints each show 3 attempts + average in ms + OK status; total time shown.
- ℹ️ HTTP round-trip, not ICMP; a warm-up request is done first so numbers reflect steady-state.

### [ ] 31. User Agent Parser — `user-agent-parser`
- **Input:** paste your own UA, plus test an iPad UA:
  `Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1`
- **Expected:** Browser Safari, OS iOS, **Device Tablet** (not "Mobile Phone"), Engine WebKit.
- 🐛 iPad used to be misclassified as a phone.

### [ ] 32. Email Header Analyzer — `email-header-analyzer`
- **Input:** paste a full raw email header block (from Gmail "Show original"). Include a folded (multi-line) `Authentication-Results` header.
- **Expected:** From/To/Subject/Date/Message-ID parsed; SPF/DKIM/DMARC verdicts colored; Received route listed origin→destination with IPs.
- 🐛 Folded multi-line headers used to be truncated to their first line.

### [ ] 33. VLSM Subnet Calculator — `vlsm-calculator`
- **Input:** base `192.168.1.0/24`, host counts `50, 10, 25, 2`
- **Expected (sorted desc):**
  - 50 → `192.168.1.0/26` (usable 62, range .1–.62)
  - 25 → `192.168.1.64/27` (usable 30, range .65–.94)
  - 10 → `192.168.1.96/28` (usable 14, range .97–.110)
  - 2 → `192.168.1.112/30` (usable 2, range .113–.114)
- 🐛 Was completely broken — returned `/0` for everything and never produced a valid allocation.

### [ ] 34. Subnet Mask Cheat Sheet — `subnet-mask-cheat-sheet`
- **Check:** scroll to the **/0** row → Mask `0.0.0.0`, Wildcard `255.255.255.255` (NOT 255.255.255.255 mask). Spot-check /24 → 255.255.255.0, /26 → 255.255.255.192. Click a row → detail panel; /31 and /32 show sane host info (RFC 3021 / single host), not negative numbers.
- 🐛 The /0 row showed mask 255.255.255.255; /31–/32 detail showed nonsense ranges.

### [ ] 35. MAC Address Lookup (OUI/Vendor) — `mac-address-lookup`
- **Input:** try these MACs:
  - `00:03:93:11:22:33` → **Apple**
  - `00:00:0C:11:22:33` → **Cisco Systems**
  - `00:1C:62:11:22:33` → **LG Electronics**
  - `00:15:6D:11:22:33` → **Ubiquiti Networks**
- **Expected:** correct vendor for each; an unknown prefix says "unknown but valid".
- 🐛 The entire OUI table was scrambled — every lookup returned a wrong vendor. Rebuilt from the authoritative IEEE registry (~100 prefixes, 20 vendors).

---

## Known limitations (NOT bugs — expected behavior)
- **IP geolocation** (tools 1, 2, 11): approximate, provider-dependent; can place an IP in a different city than reality (especially mobile/VPN).
- **External-API tools** (SSL, WHOIS, blacklist, DNS): depend on third-party services that can rate-limit or be briefly unavailable — that's a reliability limit, surfaced honestly ("Unknown", "try again"), not a wrong answer.
- **MAC lookup:** ships ~100 common OUIs; a MAC outside that set correctly reports "unknown" (full IEEE DB has 30,000+).
- **Ping test:** HTTP round-trip, not real ICMP ping (browsers can't send ICMP).

## Sign-off
- [ ] All 35 tools checked in browser
- Tester: __________________  Date: __________  Browser/OS: __________
- Notes / anything that didn't match:
