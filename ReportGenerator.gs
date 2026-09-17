// ReportGenerator.gs
/**
 * @overview Funções auxiliares para formatar e gerar os relatórios de forma estruturada no SGTE, antes de serem processados pelo Gemini ou exibidos.
 * @module ReportGenerator
 * @requires ReportService.gs para obter dados de relatórios.
 * @requires Utils.gs para funções utilitárias.
 */

function formatMonthlySavingsReport(reportData) {
  let reportText = `## Relatório Mensal de Economia - ${reportData.month}/${reportData.year}\n\n`;
  reportText += `Este relatório detalha as economias alcançadas no sistema de transporte escolar para o mês de ${reportData.month} de ${reportData.year}.\n\n`;
  reportText += `### Economias Totais\n`;
  reportText += `- **Tempo Total Economizado:** ${reportData.totalTimeSaved} minutos\n`;
  reportText += `- **Combustível Total Economizado:** ${reportData.totalFuelSaved} litros\n\n`;
  reportText += `Essas economias refletem a eficiência das otimizações de rota realizadas pelo SGTE, resultando em benefícios operacionais e financeiros.\n`;
  return reportText;
}

function generateTimeComparisonChartHtml(chartData) {
  try {
    // Esta função geraria o HTML/JavaScript para um gráfico usando uma biblioteca como Chart.js
    // Por simplicidade, retornaremos um placeholder ou um script básico.
    const chartHtml = `
      <canvas id="timeComparisonChart"></canvas>
      <script>
        var ctx = document.getElementById("timeComparisonChart").getContext("2d");
        var timeComparisonChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ${JSON.stringify(chartData.labels)},
                datasets: [{
                    label: ${JSON.stringify(chartData.datasets[0].label)},
                    data: ${JSON.stringify(chartData.datasets[0].data)},
                    backgroundColor: ${JSON.stringify(chartData.datasets[0].backgroundColor)}
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Tempo (minutos)'
                        }
                    }
                }
            }
        });
      </script>
    `;
    return chartHtml;
  } catch (error) {
    Logger.log("Erro em generateTimeComparisonChartHtml: " + error.message);
    throw error;
  }
}
