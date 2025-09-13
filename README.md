<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1tDYeuaDP9-0UBa_6BifVc9-EdH1EC3wZ

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Printing invoices

Tips for producing multipage printable invoices/receipts from the app:

- The app includes enhanced print CSS that targets elements with the `printable-area` class. Invoice and receipt views already use this class.
- To prevent critical blocks (totals, signature) from splitting across pages, wrap them with `className="avoid-break"` or `className="signature-section totals-section"`.
- If you need to force a page break (for long line items or to ensure a footer appears on a new page), insert a manual break in the JSX where appropriate:

   <div className="page-break" />

- Test printing in Chrome/Edge: open the invoice, press Print (Ctrl+P), choose destination "Save as PDF", and verify headers repeat and the totals/signature stay together.

If you want help adding manual page breaks to a particular invoice template, tell me which component/file and I can patch it for you.
