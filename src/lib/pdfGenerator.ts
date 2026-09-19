import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Transaction, BudgetConfig } from "../types";
import { formatCurrency, formatDateBangla, toBengaliNumber } from "./utils";

interface GeneratePdfOptions {
  transactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
  balance: number;
  budget: BudgetConfig;
  categoryExpenses: Record<string, number>;
  useBengaliDigits: boolean;
  periodTitle?: string;
}

export async function generateStatementPDF({
  transactions,
  totalIncome,
  totalExpense,
  balance,
  budget,
  categoryExpenses,
  useBengaliDigits,
  periodTitle,
}: GeneratePdfOptions): Promise<void> {
  // Create a dedicated off-screen container for rendering the report
  const reportContainer = document.createElement("div");
  reportContainer.id = "khorcha-pdf-render-zone";
  reportContainer.style.position = "fixed";
  reportContainer.style.top = "-99999px";
  reportContainer.style.left = "-99999px";
  reportContainer.style.width = "800px";
  reportContainer.style.backgroundColor = "#ffffff";
  reportContainer.style.color = "#18181b";
  reportContainer.style.fontFamily = "'Hind Siliguri', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";
  reportContainer.style.padding = "32px 36px";
  reportContainer.style.boxSizing = "border-box";
  reportContainer.style.zIndex = "-1000";

  const todayStr = new Date().toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const savingsRate =
    totalIncome > 0
      ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100))
      : 0;

  const sortedCategories = Object.entries(categoryExpenses)
    .filter(([_, amt]) => amt > 0)
    .sort((a, b) => b[1] - a[1]);

  // Build the clean HTML structure with Tailwind-inspired inline styling to guarantee exact rendering
  reportContainer.innerHTML = `
    <div style="border-bottom: 2px solid #e4e4e7; padding-bottom: 20px; margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="background-color: #09090b; color: #34d399; font-weight: bold; font-size: 16px; width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
              ৳
            </div>
            <h1 style="font-size: 24px; font-weight: 800; color: #09090b; margin: 0; letter-spacing: -0.5px;">
              Khorcha<span style="color: #059669;">.ai</span>
            </h1>
          </div>
          <p style="font-size: 12px; color: #71717a; margin: 4px 0 0 0;">
            আর্থিক হিসাব ও খরচের বিবরণী (Financial Statement Report)
          </p>
        </div>

        <div style="text-align: right;">
          <div style="display: inline-block; background-color: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600;">
            ${periodTitle ? `সময়কাল: ${periodTitle}` : "প্রমাণিত বিবরণী"}
          </div>
          <p style="font-size: 11px; color: #71717a; margin: 6px 0 0 0;">
            তারিখ: <strong style="color: #18181b;">${todayStr}</strong>
          </p>
          <p style="font-size: 11px; color: #71717a; margin: 2px 0 0 0;">
            মোট লেনদেন: <strong style="color: #18181b;">${
              useBengaliDigits ? toBengaliNumber(transactions.length) : transactions.length
            } টি</strong>
          </p>
        </div>
      </div>
    </div>

    <!-- Summary 4 Cards -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px;">
      <!-- Total Balance -->
      <div style="border: 1px solid #e4e4e7; border-radius: 8px; padding: 12px 14px; background-color: #fafafa;">
        <span style="font-size: 11px; color: #71717a; display: block; margin-bottom: 4px;">বর্তমান ব্যালেন্স</span>
        <div style="font-size: 18px; font-weight: 700; color: ${balance < 0 ? "#e11d48" : "#09090b"};">
          ${formatCurrency(balance, useBengaliDigits)}
        </div>
      </div>

      <!-- Total Income -->
      <div style="border: 1px solid #e4e4e7; border-radius: 8px; padding: 12px 14px; background-color: #fafafa;">
        <span style="font-size: 11px; color: #059669; display: block; margin-bottom: 4px;">মোট আয় (+)</span>
        <div style="font-size: 18px; font-weight: 700; color: #059669;">
          ${formatCurrency(totalIncome, useBengaliDigits)}
        </div>
      </div>

      <!-- Total Expense -->
      <div style="border: 1px solid #e4e4e7; border-radius: 8px; padding: 12px 14px; background-color: #fafafa;">
        <span style="font-size: 11px; color: #e11d48; display: block; margin-bottom: 4px;">মোট ব্যয় (-)</span>
        <div style="font-size: 18px; font-weight: 700; color: #e11d48;">
          ${formatCurrency(totalExpense, useBengaliDigits)}
        </div>
      </div>

      <!-- Savings Rate -->
      <div style="border: 1px solid #e4e4e7; border-radius: 8px; padding: 12px 14px; background-color: #fafafa;">
        <span style="font-size: 11px; color: #71717a; display: block; margin-bottom: 4px;">সঞ্চয়ের হার</span>
        <div style="font-size: 18px; font-weight: 700; color: #09090b;">
          ${useBengaliDigits ? `${toBengaliNumber(savingsRate)}%` : `${savingsRate}%`}
        </div>
      </div>
    </div>

    ${
      sortedCategories.length > 0
        ? `
      <!-- Category Breakdown Section -->
      <div style="margin-bottom: 24px; border: 1px solid #e4e4e7; border-radius: 8px; padding: 14px 16px; background-color: #ffffff;">
        <h3 style="font-size: 13px; font-weight: 700; color: #18181b; margin: 0 0 10px 0;">
          ক্যাটাগরি ভিত্তিক খরচের সারসংক্ষেপ
        </h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
          ${sortedCategories
            .slice(0, 6)
            .map(([cat, amt]) => {
              const pct = totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0;
              return `
                <div style="border: 1px solid #f4f4f5; border-radius: 6px; padding: 8px 10px; background-color: #fafafa;">
                  <div style="display: flex; justify-content: space-between; font-size: 11px; color: #52525b; margin-bottom: 2px;">
                    <span style="font-weight: 600;">${cat}</span>
                    <span style="color: #71717a;">${useBengaliDigits ? `${toBengaliNumber(pct)}%` : `${pct}%`}</span>
                  </div>
                  <div style="font-size: 13px; font-weight: 700; color: #18181b;">
                    ${formatCurrency(amt, useBengaliDigits)}
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    `
        : ""
    }

    <!-- Detailed Transactions Table -->
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 14px; font-weight: 700; color: #18181b; margin: 0 0 10px 0;">
        লেনদেনের পূর্ণাঙ্গ তালিকা (${
          useBengaliDigits ? toBengaliNumber(transactions.length) : transactions.length
        } টি)
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: left;">
        <thead>
          <tr style="background-color: #f4f4f5; color: #3f3f46; border-bottom: 2px solid #e4e4e7;">
            <th style="padding: 8px 10px; font-weight: 600; width: 35px;">#</th>
            <th style="padding: 8px 10px; font-weight: 600; width: 85px;">তারিখ</th>
            <th style="padding: 8px 10px; font-weight: 600;">বিবরণ / নোট</th>
            <th style="padding: 8px 10px; font-weight: 600; width: 75px;">ধরন</th>
            <th style="padding: 8px 10px; font-weight: 600; width: 95px;">ক্যাটাগরি</th>
            <th style="padding: 8px 10px; font-weight: 600; width: 75px;">মাধ্যম</th>
            <th style="padding: 8px 10px; font-weight: 600; text-align: right; width: 100px;">পরিমাণ</th>
          </tr>
        </thead>
        <tbody>
          ${
            transactions.length === 0
              ? `<tr><td colspan="7" style="padding: 20px; text-align: center; color: #a1a1aa;">কোনো লেনদেনের রেকর্ড নেই</td></tr>`
              : transactions
                  .map((tx, idx) => {
                    const isIncome = tx.type === "income";
                    const rowBg = idx % 2 === 0 ? "#ffffff" : "#fafafa";
                    return `
                      <tr style="background-color: ${rowBg}; border-bottom: 1px solid #f4f4f5;">
                        <td style="padding: 8px 10px; color: #71717a;">${
                          useBengaliDigits ? toBengaliNumber(idx + 1) : idx + 1
                        }</td>
                        <td style="padding: 8px 10px; color: #52525b;">${formatDateBangla(tx.date)}</td>
                        <td style="padding: 8px 10px; font-weight: 600; color: #18181b;">${tx.note}</td>
                        <td style="padding: 8px 10px;">
                          <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; ${
                            isIncome
                              ? "background-color: #ecfdf5; color: #065f46;"
                              : "background-color: #fff1f2; color: #9f1239;"
                          }">
                            ${isIncome ? "আয়" : "খরচ"}
                          </span>
                        </td>
                        <td style="padding: 8px 10px; color: #52525b;">${tx.category}</td>
                        <td style="padding: 8px 10px; color: #71717a;">${tx.paymentMethod}</td>
                        <td style="padding: 8px 10px; text-align: right; font-weight: 700; color: ${
                          isIncome ? "#059669" : "#18181b"
                        };">
                          ${isIncome ? "+" : "-"}${formatCurrency(tx.amount, useBengaliDigits)}
                        </td>
                      </tr>
                    `;
                  })
                  .join("")
          }
        </tbody>
      </table>
    </div>

    <!-- Footer of the report -->
    <div style="border-top: 1px solid #e4e4e7; padding-top: 14px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #71717a;">
      <span>Khorcha.ai — সহজ বাংলা মানি ম্যানেজমেন্ট ও বাজেট ট্র্যাকার</span>
      <span>তৈরি হয়েছে: ${new Date().toLocaleString("bn-BD")}</span>
    </div>
  `;

  document.body.appendChild(reportContainer);

  try {
    // Render using html2canvas with scale 2 for high-DPI quality
    const canvas = await html2canvas(reportContainer, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add extra pages if content spans beyond a single page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    // Save and download the PDF
    const fileName = `Khorcha-ai-statement-${new Date().toISOString().slice(0, 10)}.pdf`;
    pdf.save(fileName);
  } finally {
    // Always clean up the temporary DOM element
    if (document.body.contains(reportContainer)) {
      document.body.removeChild(reportContainer);
    }
  }
}
