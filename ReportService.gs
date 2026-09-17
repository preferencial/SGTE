// ReportService.gs
/**
 * @overview Gera relatórios diversos no SGTE, incluindo o relatório mensal de economia de tempo e combustível.
 *           Coleta dados de viagens e otimizações para calcular as métricas.
 * @module ReportService
 * @requires DataService.gs para obter dados de otimizações e viagens.
 * @requires OptimizationResultService.gs para acessar resultados de otimização.
 * @requires GeminiIntegrationService.gs para gerar relatórios textuais com IA.
 * @requires Logger.gs para registro de operações.
 */

function generateMonthlySavingsReport(month, year) {
  try {
    const reportMonth = Number(month);
    const reportYear = Number(year);
    if (!isFinite(reportMonth) || Math.floor(reportMonth) !== reportMonth || reportMonth < 1 || reportMonth > 12 ||
        !isFinite(reportYear) || Math.floor(reportYear) !== reportYear || reportYear < 1 || reportYear > 9999) {
      throw new Error('Mês e ano do relatório são inválidos.');
    }
    info(`Gerando relatório de economia para ${reportMonth}/${reportYear}`);
    const optimizationResults = getOptimizationResultsByMonth(reportMonth, reportYear);

    let totalTimeSaved = 0;
    let totalFuelSaved = 0;
    let totalOriginalDuration = 0;
    let totalOptimizedDuration = 0;

    optimizationResults.forEach(result => {
      totalTimeSaved += Number(result.TimeSaved) || 0;
      totalFuelSaved += Number(result.FuelSaved) || 0;
      totalOriginalDuration += Number(result.OriginalDuration) || 0;
      totalOptimizedDuration += Number(result.OptimizedDuration) || 0;
    });

    const reportData = {
      month: reportMonth,
      year: reportYear,
      totalTimeSaved: totalTimeSaved,
      totalFuelSaved: totalFuelSaved,
      optimizationCount: optimizationResults.length
    };

    const count = optimizationResults.length;
    const chartData = {
      labels: ["Duração original", "Duração otimizada"],
      datasets: [{
        label: "Tempo médio de rota (minutos)",
        data: [
          count ? totalOriginalDuration / count : 0,
          count ? totalOptimizedDuration / count : 0
        ],
        backgroundColor: ["#ef5350", "#26a69a"]
      }]
    };

    const geminiReport = generateSavingsSummary(reportData);

    return {
      data: reportData,
      summary: geminiReport,
      chartData: chartData
    };
  } catch (error) {
    Logger.log("Erro em generateMonthlySavingsReport: " + error.message);
    throw error;
  }
}

function generateTimeComparisonChartData() {
  const comparison = getRawDataForTimeComparison();
  const data = {
    labels: ["Sem SGTE", "Com SGTE (Avisado)", "Com SGTE (Não Avisado)"],
    datasets: [
      {
        label: "Tempo médio no ônibus (minutos)",
        data: [comparison.noSgte, comparison.withNotice, comparison.withoutNotice],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"]
      }
    ]
  };
  data.dataAvailable = comparison.dataAvailable;
  data.samples = comparison.samples;
  return data;
}
