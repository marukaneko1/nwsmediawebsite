# How to get "NWS Media" to show up on Google

Your site already has solid on-page SEO (title, description, canonical, structured data, sitemap). To show up when people search **"nws media"**, do these steps.

---

## 1. Add your site to Google Search Console (required)

This tells Google your site exists and lets you submit your sitemap and request indexing.

1. Go to **[Google Search Console](https://search.google.com/search-console)** and sign in with your Google account.
2. Click **Add property**.
3. Choose **URL prefix** and enter: `https://nwsmedia.com`
4. **Verify ownership** using one of these:
   - **HTML tag (easiest):** Search Console will give you a meta tag like  
     `<meta name="google-site-verification" content="xxxxx" />`  
     Add it in the `<head>` of your homepage (index.html), then click **Verify** in Search Console.
   - **DNS:** Add the TXT record they give you at your domain registrar (e.g. GoDaddy).
5. After verification, go to **Sitemaps** in the left menu.
6. Enter: `https://nwsmedia.com/sitemap.xml` and click **Submit**.
7. Go to **URL Inspection**, enter `https://nwsmedia.com`, and click **Request indexing** so Google crawls the homepage soon.

---

## 2. Claim your Google Business Profile (strongly recommended)

For a business name like "NWS Media", a **Google Business Profile** (formerly Google My Business) helps a lot. It can show your site, hours, and a map when people search your name.

1. Go to **[Google Business Profile](https://business.google.com)** and sign in.
2. Click **Add your business to Google** (or **Manage** if it already exists).
3. Enter **NWS Media** and your category (e.g. "Marketing agency" or "Web design company").
4. Add your location (or choose "I serve customers at their location" if you’re service-area only).
5. Add your website: `https://nwsmedia.com`
6. Complete verification (postcard, phone, or email, depending on what Google offers).

Once verified, keep your profile updated (hours, services, photos). That directly supports searches for "nws media".

---

## 3. Give it a little time

- After you submit the sitemap and request indexing, it can take from a few days to a couple of weeks for your homepage to appear for "nws media".
- If your domain is new or has few backlinks, it may take longer. Keep the site live and avoid blocking Google in `robots.txt` (yours already allows crawling).

---

## 4. Optional: add social links to your schema

If you have LinkedIn, X/Twitter, or Instagram for NWS Media, add those URLs to the **Organization** structured data on your site. In the JSON-LD, update the `"sameAs": []` array to something like:

```json
"sameAs": [
  "https://www.linkedin.com/company/nws-media",
  "https://twitter.com/nwsmedia",
  "https://www.instagram.com/nwsmedia"
]
```

(Use your real profile URLs.) That helps Google connect your brand across the web.

---

## Quick checklist

| Step | Action |
|------|--------|
| ✅ | Site has title, description, canonical, sitemap, robots.txt |
| ✅ | "NWS Media" in hero eyebrow and structured data |
| ⬜ | Add property in Google Search Console and verify |
| ⬜ | Submit sitemap: `https://nwsmedia.com/sitemap.xml` |
| ⬜ | Request indexing for `https://nwsmedia.com` |
| ⬜ | Create/claim and verify Google Business Profile |
| ⬜ | (Optional) Add social URLs to Organization `sameAs` |

After you complete the checklist, searches for **"nws media"** are much more likely to show your site (and, if you set it up, your Google Business listing).
