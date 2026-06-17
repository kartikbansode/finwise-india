export default function TaxDisclaimer() {
  return (
    <div
      className="
      mt-8
      rounded-xl
      border border-gray-200 dark:border-zinc-800
      bg-white dark:bg-zinc-900
      p-5
      "
    >
      <h3 className="font-semibold text-gray-900 dark:text-white">
        Tax & Financial Disclaimer
      </h3>

      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        FinWise India provides estimated tax calculations,
        GST projections, advance tax estimates, presumptive
        taxation calculations under Sections 44ADA and 44AD,
        financial insights, and cash-flow guidance for
        informational purposes only.
      </p>

      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        Results may vary depending on deductions,
        exemptions, income sources, business structure,
        applicable tax laws, and changes introduced by
        government authorities.
      </p>

      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        Users should consult a qualified Chartered
        Accountant (CA), tax professional, or financial
        advisor before filing tax returns or making
        significant financial decisions.
      </p>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800">
        <p className="text-xs text-gray-500 dark:text-gray-500">
          FinWise India is a financial management platform
          and does not provide legal, accounting, tax, or
          investment advisory services.
        </p>
      </div>
    </div>
  );
}