/**
 * Dados sintéticos — Preferencial - SGTE
 * Gerado em 2026-06-21 01:10:44 por generate_synthetic_data_all_projects.py
 *
 * Execute populateSyntheticData() PELO EDITOR do Apps Script para popular
 * as abas de domínio com ~30 registros cada (valida os gráficos do notebook).
 * Idempotente: limpa as linhas de dados antes de reinserir.
 *
 * NÃO define onOpen() — para não colidir com o menu real do projeto.
 */

function populateSyntheticData() {
  try {
    try {
      try {
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var results = [];

        // Rotas
        try {
          var sheet_Rotas = ss.getSheetByName('Rotas') || ss.insertSheet('Rotas');
          if (sheet_Rotas.getLastRow() > 1) {
            sheet_Rotas.deleteRows(2, sheet_Rotas.getLastRow() - 1);
          }
          var h_sheet_Rotas = ["ID", "RouteName", "Motorista", "Veiculo", "Capacidade", "Atendidos", "DistanciaKm", "Status"];
          sheet_Rotas.getRange(1, 1, 1, h_sheet_Rotas.length).setValues([h_sheet_Rotas]);
          var d_sheet_Rotas = [
            ["ROT-0001", "Carla Oliveira", "Carla Oliveira", "A", 19, 1, 24.1, "ativo"],
            ["ROT-0002", "Henrique Alves", "Gabriela Rocha", "C", 38, 12, 20.8, "ativo"],
            ["ROT-0003", "Bruno Santos", "Diego Souza", "C", 41, 22, 2.9, "inativo"],
            ["ROT-0004", "Eduarda Lima", "Felipe Costa", "D", 30, 12, 38.2, "ativo"],
            ["ROT-0005", "Diego Souza", "Gabriela Rocha", "C", 46, 40, 13.3, "ativo"],
            ["ROT-0006", "Eduarda Lima", "Carla Oliveira", "A", 28, 18, 20.0, "ativo"],
            ["ROT-0007", "Carla Oliveira", "Eduarda Lima", "C", 48, 7, 37.1, "ativo"],
            ["ROT-0008", "Carla Oliveira", "Bruno Santos", "B", 45, 33, 30.4, "ativo"],
            ["ROT-0009", "Ana Silva", "Diego Souza", "A", 41, 2, 15.4, "ativo"],
            ["ROT-0010", "Gabriela Rocha", "Henrique Alves", "B", 39, 19, 36.8, "ativo"],
            ["ROT-0011", "Henrique Alves", "Gabriela Rocha", "D", 26, 6, 34.7, "ativo"],
            ["ROT-0012", "Bruno Santos", "Felipe Costa", "A", 57, 15, 29.4, "ativo"],
            ["ROT-0013", "Carla Oliveira", "Felipe Costa", "C", 39, 33, 27.2, "ativo"],
            ["ROT-0014", "Felipe Costa", "Ana Silva", "D", 16, 34, 13.4, "ativo"],
            ["ROT-0015", "Ana Silva", "Diego Souza", "B", 47, 25, 35.0, "ativo"],
            ["ROT-0016", "Diego Souza", "Eduarda Lima", "D", 19, 32, 32.7, "inativo"],
            ["ROT-0017", "Eduarda Lima", "Carla Oliveira", "B", 50, 6, 38.1, "ativo"],
            ["ROT-0018", "Ana Silva", "Gabriela Rocha", "A", 41, 36, 24.8, "ativo"],
            ["ROT-0019", "Ana Silva", "Gabriela Rocha", "C", 49, 25, 25.6, "ativo"],
            ["ROT-0020", "Felipe Costa", "Henrique Alves", "B", 29, 15, 35.1, "inativo"],
            ["ROT-0021", "Henrique Alves", "Gabriela Rocha", "C", 44, 31, 12.5, "ativo"],
            ["ROT-0022", "Bruno Santos", "Eduarda Lima", "D", 38, 21, 10.6, "inativo"],
            ["ROT-0023", "Bruno Santos", "Carla Oliveira", "D", 30, 8, 14.6, "inativo"],
            ["ROT-0024", "Carla Oliveira", "Henrique Alves", "D", 48, 27, 27.8, "ativo"],
            ["ROT-0025", "Eduarda Lima", "Eduarda Lima", "B", 60, 27, 3.4, "ativo"],
            ["ROT-0026", "Eduarda Lima", "Felipe Costa", "D", 35, 29, 17.6, "ativo"],
            ["ROT-0027", "Ana Silva", "Eduarda Lima", "D", 56, 15, 14.3, "ativo"],
            ["ROT-0028", "Eduarda Lima", "Henrique Alves", "D", 24, 37, 35.1, "ativo"],
            ["ROT-0029", "Bruno Santos", "Felipe Costa", "B", 48, 35, 1.8, "ativo"],
            ["ROT-0030", "Gabriela Rocha", "Bruno Santos", "C", 32, 36, 3.5, "ativo"]
          ];
          sheet_Rotas.getRange(2, 1, d_sheet_Rotas.length, h_sheet_Rotas.length).setValues(d_sheet_Rotas);
          results.push('OK Rotas: ' + d_sheet_Rotas.length + ' registros');
        } catch (e) {
          results.push('ERRO Rotas: ' + e.message);
        }

        // Veiculos
        try {
          var sheet_Veiculos = ss.getSheetByName('Veiculos') || ss.insertSheet('Veiculos');
          if (sheet_Veiculos.getLastRow() > 1) {
            sheet_Veiculos.deleteRows(2, sheet_Veiculos.getLastRow() - 1);
          }
          var h_sheet_Veiculos = ["ID", "Placa", "Modelo", "Capacidade", "Combustivel", "AnoFabricacao", "Status"];
          sheet_Veiculos.getRange(1, 1, 1, h_sheet_Veiculos.length).setValues([h_sheet_Veiculos]);
          var d_sheet_Veiculos = [
            ["VEI-0001", "QGL-9773", "Ducato", 20, "eletrico", 2015, "ativo"],
            ["VEI-0002", "ZFL-6431", "Daily", 23, "gasolina", 2008, "ativo"],
            ["VEI-0003", "AYQ-2679", "Iveco", 35, "eletrico", 2009, "ativo"],
            ["VEI-0004", "JJA-4768", "Volare", 59, "gasolina", 2009, "ativo"],
            ["VEI-0005", "XDZ-7190", "Volare", 35, "gasolina", 2016, "ativo"],
            ["VEI-0006", "CCQ-7805", "Sprinter", 10, "gasolina", 2011, "inativo"],
            ["VEI-0007", "GTJ-6303", "Daily", 42, "diesel", 2017, "ativo"],
            ["VEI-0008", "OGD-5329", "Volare", 46, "eletrico", 2020, "ativo"],
            ["VEI-0009", "NCH-7657", "Iveco", 27, "eletrico", 2017, "ativo"],
            ["VEI-0010", "MAP-7449", "Master", 58, "diesel", 2022, "ativo"],
            ["VEI-0011", "SAM-4802", "Daily", 33, "eletrico", 2011, "ativo"],
            ["VEI-0012", "KEZ-2370", "Sprinter", 45, "gasolina", 2014, "inativo"],
            ["VEI-0013", "SHC-3315", "Daily", 49, "eletrico", 2024, "ativo"],
            ["VEI-0014", "BYP-5129", "Daily", 29, "etanol", 2012, "ativo"],
            ["VEI-0015", "KWS-7660", "Sprinter", 27, "gasolina", 2023, "inativo"],
            ["VEI-0016", "KUH-6272", "Daily", 55, "eletrico", 2024, "ativo"],
            ["VEI-0017", "DNW-2269", "Daily", 18, "diesel", 2013, "ativo"],
            ["VEI-0018", "FGO-2862", "Sprinter", 37, "eletrico", 2013, "inativo"],
            ["VEI-0019", "EXR-7850", "Daily", 10, "etanol", 2011, "inativo"],
            ["VEI-0020", "JXV-5441", "Iveco", 30, "etanol", 2013, "ativo"],
            ["VEI-0021", "JQV-4349", "Iveco", 55, "etanol", 2024, "ativo"],
            ["VEI-0022", "POG-6409", "Volare", 56, "gasolina", 2013, "inativo"],
            ["VEI-0023", "AKN-3936", "Ducato", 40, "diesel", 2008, "ativo"],
            ["VEI-0024", "WGG-2537", "Iveco", 39, "etanol", 2011, "ativo"],
            ["VEI-0025", "TOT-3563", "Sprinter", 32, "gasolina", 2019, "ativo"],
            ["VEI-0026", "GIJ-7982", "Iveco", 56, "etanol", 2019, "inativo"],
            ["VEI-0027", "IRR-4319", "Sprinter", 47, "gasolina", 2011, "ativo"],
            ["VEI-0028", "IFI-2676", "Ducato", 43, "eletrico", 2018, "ativo"],
            ["VEI-0029", "ZXT-8756", "Ducato", 20, "diesel", 2015, "ativo"],
            ["VEI-0030", "CZT-3400", "Ducato", 20, "eletrico", 2008, "ativo"]
          ];
          sheet_Veiculos.getRange(2, 1, d_sheet_Veiculos.length, h_sheet_Veiculos.length).setValues(d_sheet_Veiculos);
          results.push('OK Veiculos: ' + d_sheet_Veiculos.length + ' registros');
        } catch (e) {
          results.push('ERRO Veiculos: ' + e.message);
        }

        // Motoristas
        try {
          var sheet_Motoristas = ss.getSheetByName('Motoristas') || ss.insertSheet('Motoristas');
          if (sheet_Motoristas.getLastRow() > 1) {
            sheet_Motoristas.deleteRows(2, sheet_Motoristas.getLastRow() - 1);
          }
          var h_sheet_Motoristas = ["ID", "Nome", "CNH", "Periodo", "Status", "CreatedAt"];
          sheet_Motoristas.getRange(1, 1, 1, h_sheet_Motoristas.length).setValues([h_sheet_Motoristas]);
          var d_sheet_Motoristas = [
            ["MOT-0001", "Bruno Santos", "17004714", "tarde", "inativo", "2026-04-27 01:10:44"],
            ["MOT-0002", "Henrique Alves", "53901191", "noite", "ativo", "2026-05-21 01:10:44"],
            ["MOT-0003", "Gabriela Rocha", "60641630", "integral", "inativo", "2026-05-06 01:10:44"],
            ["MOT-0004", "Eduarda Lima", "80059735", "noite", "ativo", "2026-04-04 01:10:44"],
            ["MOT-0005", "Diego Souza", "32295753", "noite", "ativo", "2026-04-26 01:10:44"],
            ["MOT-0006", "Henrique Alves", "75779236", "noite", "ativo", "2026-04-10 01:10:44"],
            ["MOT-0007", "Gabriela Rocha", "97522323", "noite", "ativo", "2026-06-17 01:10:44"],
            ["MOT-0008", "Felipe Costa", "72555645", "noite", "inativo", "2026-05-24 01:10:44"],
            ["MOT-0009", "Diego Souza", "61332565", "noite", "ativo", "2026-06-19 01:10:44"],
            ["MOT-0010", "Diego Souza", "69335049", "noite", "ativo", "2026-06-20 01:10:44"],
            ["MOT-0011", "Eduarda Lima", "54084020", "manhã", "ativo", "2026-05-19 01:10:44"],
            ["MOT-0012", "Ana Silva", "91439883", "noite", "ativo", "2026-03-30 01:10:44"],
            ["MOT-0013", "Eduarda Lima", "96124034", "integral", "inativo", "2026-06-15 01:10:44"],
            ["MOT-0014", "Eduarda Lima", "46798988", "manhã", "ativo", "2026-04-21 01:10:44"],
            ["MOT-0015", "Henrique Alves", "75807017", "tarde", "inativo", "2026-03-30 01:10:44"],
            ["MOT-0016", "Bruno Santos", "15126257", "noite", "ativo", "2026-04-03 01:10:44"],
            ["MOT-0017", "Carla Oliveira", "33744145", "tarde", "ativo", "2026-04-28 01:10:44"],
            ["MOT-0018", "Bruno Santos", "17522634", "integral", "ativo", "2026-05-11 01:10:44"],
            ["MOT-0019", "Bruno Santos", "83025649", "noite", "ativo", "2026-03-29 01:10:44"],
            ["MOT-0020", "Ana Silva", "54649538", "noite", "ativo", "2026-04-06 01:10:44"],
            ["MOT-0021", "Felipe Costa", "79302042", "manhã", "inativo", "2026-04-28 01:10:44"],
            ["MOT-0022", "Ana Silva", "18718099", "tarde", "ativo", "2026-05-17 01:10:44"],
            ["MOT-0023", "Bruno Santos", "33163997", "integral", "ativo", "2026-05-16 01:10:44"],
            ["MOT-0024", "Diego Souza", "77842475", "integral", "ativo", "2026-03-31 01:10:44"],
            ["MOT-0025", "Ana Silva", "51763795", "noite", "ativo", "2026-06-05 01:10:44"],
            ["MOT-0026", "Felipe Costa", "72579321", "manhã", "inativo", "2026-06-09 01:10:44"],
            ["MOT-0027", "Bruno Santos", "22154988", "tarde", "ativo", "2026-05-28 01:10:44"],
            ["MOT-0028", "Felipe Costa", "89342612", "manhã", "ativo", "2026-06-19 01:10:44"],
            ["MOT-0029", "Diego Souza", "95623611", "noite", "inativo", "2026-06-10 01:10:44"],
            ["MOT-0030", "Diego Souza", "51309843", "tarde", "ativo", "2026-05-12 01:10:44"]
          ];
          sheet_Motoristas.getRange(2, 1, d_sheet_Motoristas.length, h_sheet_Motoristas.length).setValues(d_sheet_Motoristas);
          results.push('OK Motoristas: ' + d_sheet_Motoristas.length + ' registros');
        } catch (e) {
          results.push('ERRO Motoristas: ' + e.message);
        }

        // Viagens
        try {
          var sheet_Viagens = ss.getSheetByName('Viagens') || ss.insertSheet('Viagens');
          if (sheet_Viagens.getLastRow() > 1) {
            sheet_Viagens.deleteRows(2, sheet_Viagens.getLastRow() - 1);
          }
          var h_sheet_Viagens = ["ID", "Data", "Rota", "Transportados", "DuracaoMin", "DistanciaKm", "Status"];
          sheet_Viagens.getRange(1, 1, 1, h_sheet_Viagens.length).setValues([h_sheet_Viagens]);
          var d_sheet_Viagens = [
            ["VIA-0001", "2026-06-18 01:10:44", "D", 19, 212, 11.9, "ativo"],
            ["VIA-0002", "2026-05-26 01:10:44", "B", 13, 309, 35.5, "ativo"],
            ["VIA-0003", "2026-06-03 01:10:44", "C", 29, 300, 4.6, "ativo"],
            ["VIA-0004", "2026-05-15 01:10:44", "C", 23, 565, 18.5, "ativo"],
            ["VIA-0005", "2026-06-19 01:10:44", "D", 10, 580, 23.2, "inativo"],
            ["VIA-0006", "2026-05-30 01:10:44", "C", 14, 380, 28.3, "ativo"],
            ["VIA-0007", "2026-06-16 01:10:44", "B", 17, 253, 19.2, "ativo"],
            ["VIA-0008", "2026-04-23 01:10:44", "A", 34, 220, 19.5, "inativo"],
            ["VIA-0009", "2026-05-15 01:10:44", "C", 24, 416, 26.7, "ativo"],
            ["VIA-0010", "2026-06-01 01:10:44", "A", 23, 38, 7.2, "inativo"],
            ["VIA-0011", "2026-05-31 01:10:44", "C", 7, 221, 36.6, "ativo"],
            ["VIA-0012", "2026-06-11 01:10:44", "D", 35, 220, 30.3, "inativo"],
            ["VIA-0013", "2026-05-01 01:10:44", "D", 38, 475, 29.5, "inativo"],
            ["VIA-0014", "2026-04-29 01:10:44", "B", 17, 412, 24.4, "inativo"],
            ["VIA-0015", "2026-05-09 01:10:44", "D", 20, 71, 38.9, "ativo"],
            ["VIA-0016", "2026-05-04 01:10:44", "A", 27, 466, 31.2, "inativo"],
            ["VIA-0017", "2026-05-15 01:10:44", "A", 11, 554, 7.5, "ativo"],
            ["VIA-0018", "2026-04-26 01:10:44", "B", 37, 172, 6.1, "ativo"],
            ["VIA-0019", "2026-05-02 01:10:44", "A", 6, 346, 31.9, "ativo"],
            ["VIA-0020", "2026-05-01 01:10:44", "C", 30, 435, 7.4, "ativo"],
            ["VIA-0021", "2026-05-10 01:10:44", "B", 13, 206, 12.8, "ativo"],
            ["VIA-0022", "2026-06-10 01:10:44", "B", 14, 477, 4.5, "ativo"],
            ["VIA-0023", "2026-06-12 01:10:44", "C", 1, 518, 7.2, "ativo"],
            ["VIA-0024", "2026-05-22 01:10:44", "D", 14, 513, 27.1, "inativo"],
            ["VIA-0025", "2026-05-07 01:10:44", "B", 7, 426, 6.0, "ativo"],
            ["VIA-0026", "2026-05-27 01:10:44", "C", 19, 464, 24.3, "ativo"],
            ["VIA-0027", "2026-05-30 01:10:44", "D", 38, 57, 9.6, "ativo"],
            ["VIA-0028", "2026-05-03 01:10:44", "B", 24, 400, 14.3, "ativo"],
            ["VIA-0029", "2026-05-13 01:10:44", "D", 5, 265, 6.4, "ativo"],
            ["VIA-0030", "2026-06-19 01:10:44", "B", 20, 475, 4.6, "inativo"]
          ];
          sheet_Viagens.getRange(2, 1, d_sheet_Viagens.length, h_sheet_Viagens.length).setValues(d_sheet_Viagens);
          results.push('OK Viagens: ' + d_sheet_Viagens.length + ' registros');
        } catch (e) {
          results.push('ERRO Viagens: ' + e.message);
        }

        // PontosParada
        try {
          var sheet_PontosParada = ss.getSheetByName('PontosParada') || ss.insertSheet('PontosParada');
          if (sheet_PontosParada.getLastRow() > 1) {
            sheet_PontosParada.deleteRows(2, sheet_PontosParada.getLastRow() - 1);
          }
          var h_sheet_PontosParada = ["ID", "Nome", "Bairro", "Atendidos", "Ordem", "Status"];
          sheet_PontosParada.getRange(1, 1, 1, h_sheet_PontosParada.length).setValues([h_sheet_PontosParada]);
          var d_sheet_PontosParada = [
            ["PON-0001", "Carla Oliveira", "Núcleo Central", 10, "C", "ativo"],
            ["PON-0002", "Gabriela Rocha", "Núcleo Central", 3, "C", "inativo"],
            ["PON-0003", "Carla Oliveira", "Setor B", 26, "A", "inativo"],
            ["PON-0004", "Bruno Santos", "Setor C", 7, "D", "ativo"],
            ["PON-0005", "Carla Oliveira", "Setor C", 9, "D", "inativo"],
            ["PON-0006", "Ana Silva", "Núcleo Central", 26, "D", "ativo"],
            ["PON-0007", "Eduarda Lima", "Núcleo Central", 17, "A", "inativo"],
            ["PON-0008", "Felipe Costa", "Núcleo Central", 22, "C", "ativo"],
            ["PON-0009", "Carla Oliveira", "Núcleo Central", 35, "D", "ativo"],
            ["PON-0010", "Carla Oliveira", "Setor A", 22, "C", "ativo"],
            ["PON-0011", "Henrique Alves", "Núcleo Central", 4, "D", "ativo"],
            ["PON-0012", "Ana Silva", "Setor A", 32, "D", "ativo"],
            ["PON-0013", "Ana Silva", "Setor C", 17, "D", "ativo"],
            ["PON-0014", "Eduarda Lima", "Setor A", 35, "C", "ativo"],
            ["PON-0015", "Eduarda Lima", "Setor C", 27, "A", "inativo"],
            ["PON-0016", "Felipe Costa", "Setor C", 3, "A", "ativo"],
            ["PON-0017", "Ana Silva", "Núcleo Central", 16, "B", "ativo"],
            ["PON-0018", "Bruno Santos", "Setor B", 10, "D", "inativo"],
            ["PON-0019", "Eduarda Lima", "Setor C", 30, "B", "inativo"],
            ["PON-0020", "Ana Silva", "Setor A", 21, "C", "ativo"],
            ["PON-0021", "Carla Oliveira", "Setor A", 25, "A", "ativo"],
            ["PON-0022", "Eduarda Lima", "Núcleo Central", 26, "A", "ativo"],
            ["PON-0023", "Eduarda Lima", "Setor A", 28, "A", "ativo"],
            ["PON-0024", "Eduarda Lima", "Setor C", 40, "B", "ativo"],
            ["PON-0025", "Felipe Costa", "Núcleo Central", 14, "D", "ativo"],
            ["PON-0026", "Carla Oliveira", "Setor C", 33, "A", "inativo"],
            ["PON-0027", "Carla Oliveira", "Setor C", 18, "A", "inativo"],
            ["PON-0028", "Diego Souza", "Setor A", 27, "B", "ativo"],
            ["PON-0029", "Eduarda Lima", "Núcleo Central", 39, "C", "ativo"],
            ["PON-0030", "Diego Souza", "Setor B", 2, "C", "ativo"]
          ];
          sheet_PontosParada.getRange(2, 1, d_sheet_PontosParada.length, h_sheet_PontosParada.length).setValues(d_sheet_PontosParada);
          results.push('OK PontosParada: ' + d_sheet_PontosParada.length + ' registros');
        } catch (e) {
          results.push('ERRO PontosParada: ' + e.message);
        }

        Logger.log(results.join('\n'));
        return results;
      } catch (error) {
        Logger.log("Erro em populateSyntheticData: " + error.message);
        throw error; // Re-lança para tratamento superior
      }
    } catch (error) {
      Logger.log("Erro em populateSyntheticData: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em populateSyntheticData: " + error.message);
    throw error;
  }
}
