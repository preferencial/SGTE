/**
 * Popula o SGTE com um cenario pequeno e coerente de demonstracao.
 *
 * Contas criadas:
 * - 1 administrador
 * - 5 transportadores/monitores
 * - 9 familiares
 *
 * Senha comum das contas sinteticas: lida de Script Properties (SGTE_DEMO_PASSWORD).
 * A funcao pode ser executada novamente sem duplicar os registros.
 */
function popularDadosSinteticosSgte() {
  try {
    try {
      montarPlanilhaSgte();

      var demoPassword = PropertiesService.getScriptProperties().getProperty('SGTE_DEMO_PASSWORD') || 'Demo@123';

      const result = {
        created: {
          users: 0,
          schools: 0,
          drivers: 0,
          vehicles: 0,
          routes: 0,
          students: 0,
          stopPoints: 0,
          trips: 0,
          attendance: 0
        },
        existing: {},
        credentials: {
          password: demoPassword,
          users: []
        }
      };

      const schools = createSyntheticSchools_(result);
      const drivers = createSyntheticDrivers_(result);
      const vehicles = createSyntheticVehicles_(result);
      const routes = createSyntheticRoutes_(drivers, vehicles, result);

      createSyntheticUsers_(result);
      const students = createSyntheticStudents_(schools, routes, result);
      createSyntheticStopPoints_(routes, result);
      createSyntheticTripsAndAttendance_(routes, students, result);

      result.existing = {
        users: getAllRecords("USERS").length,
        schools: getAllRecords("SCHOOLS").length,
        drivers: getAllRecords("DRIVERS").length,
        vehicles: getAllRecords("VEHICLES").length,
        routes: getAllRecords("ROUTES").length,
        students: getAllRecords("STUDENTS").length
      };

      LoggerService.info(JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      Logger.log("Erro em popularDadosSinteticosSgte: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em popularDadosSinteticosSgte: " + error.message);
    throw error;
  }
}

function createSyntheticUsers_(result) {
  try {
    const definitions = [
      ["admin.demo", "Admin", "admin.demo@sgte.local"],
      ["monitor01", "Transporter", "monitor01@sgte.local"],
      ["monitor02", "Transporter", "monitor02@sgte.local"],
      ["monitor03", "Transporter", "monitor03@sgte.local"],
      ["monitor04", "Transporter", "monitor04@sgte.local"],
      ["monitor05", "Transporter", "monitor05@sgte.local"],
      ["familia01", "Family", "familia01@sgte.local"],
      ["familia02", "Family", "familia02@sgte.local"],
      ["familia03", "Family", "familia03@sgte.local"],
      ["familia04", "Family", "familia04@sgte.local"],
      ["familia05", "Family", "familia05@sgte.local"],
      ["familia06", "Family", "familia06@sgte.local"],
      ["familia07", "Family", "familia07@sgte.local"],
      ["familia08", "Family", "familia08@sgte.local"],
      ["familia09", "Family", "familia09@sgte.local"]
    ];

    definitions.forEach(function(definition) {
      const username = definition[0];
      const role = definition[1];
      const email = definition[2];
      const record = findRecordByField_("USERS", "Username", username);

      if (!record) {
        createRecord("USERS", {
          Username: username,
          Password: result.credentials.password,
          Role: role,
          Status: "Active",
          Email: email
        });
        result.created.users++;
      }

      result.credentials.users.push({ username: username, role: role });
    });
  } catch (error) {
    Logger.log("Erro em createSyntheticUsers_: " + error.message);
    throw error;
  }
}

function createSyntheticSchools_(result) {
  try {
    const definitions = [
      ["Escola Classe Horizonte", "QNM 12, Ceilandia - DF", -15.8171, -48.1074],
      ["Centro Educacional Veredas", "QNL 08, Taguatinga - DF", -15.8338, -48.0624],
      ["CEF Caminhos do Saber", "QR 406, Samambaia - DF", -15.8792, -48.0891]
    ];

    return definitions.map(function(definition, index) {
      let record = findRecordByField_("SCHOOLS", "Name", definition[0]);
      if (!record) {
        record = createRecord("SCHOOLS", {
          Name: definition[0],
          Address: definition[1],
          Latitude: definition[2],
          Longitude: definition[3],
          ContactPerson: "Secretaria " + (index + 1),
          ContactPhone: "(61) 3333-10" + String(index + 1).padStart(2, "0"),
          Status: "Active"
        });
        result.created.schools++;
      }
      return record;
    });
  } catch (error) {
    Logger.log("Erro em createSyntheticSchools_: " + error.message);
    throw error;
  }
}

function createSyntheticDrivers_(result) {
  try {
    const names = [
      "Carlos Mendes",
      "Fernanda Rocha",
      "Joao Batista",
      "Luciana Alves",
      "Marcos Pereira"
    ];

    return names.map(function(name, index) {
      const license = "CNH-DEMO-" + String(index + 1).padStart(3, "0");
      let record = findRecordByField_("DRIVERS", "LicenseNumber", license);
      if (!record) {
        record = createRecord("DRIVERS", {
          Name: name,
          LicenseNumber: license,
          ContactPhone: "(61) 99990-" + String(1100 + index),
          Email: "motorista" + (index + 1) + "@sgte.local",
          Status: "Available"
        });
        result.created.drivers++;
      }
      return record;
    });
  } catch (error) {
    Logger.log("Erro em createSyntheticDrivers_: " + error.message);
    throw error;
  }
}

function createSyntheticVehicles_(result) {
  try {
    const definitions = [
      ["SGT1A01", "Mercedes Sprinter", "Van", 20, "Diesel"],
      ["SGT1A02", "Volare V8", "Micro-onibus", 28, "Diesel"],
      ["SGT1A03", "Iveco Daily", "Van", 18, "Diesel"],
      ["SGT1A04", "Marcopolo Senior", "Micro-onibus", 30, "Diesel"],
      ["SGT1A05", "Renault Master", "Van", 16, "Diesel"]
    ];

    return definitions.map(function(definition, index) {
      let record = findRecordByField_("VEHICLES", "LicensePlate", definition[0]);
      if (!record) {
        record = createRecord("VEHICLES", {
          LicensePlate: definition[0],
          Model: definition[1],
          Type: definition[2],
          Capacity: definition[3],
          FuelType: definition[4],
          IsAccessible: index === 1,
          Status: "Available"
        });
        result.created.vehicles++;
      }
      return record;
    });
  } catch (error) {
    Logger.log("Erro em createSyntheticVehicles_: " + error.message);
    throw error;
  }
}

function createSyntheticRoutes_(drivers, vehicles, result) {
  try {
    return vehicles.map(function(vehicle, index) {
      const name = "Rota Demonstracao " + String(index + 1).padStart(2, "0");
      let record = findRecordByField_("ROUTES", "RouteName", name);
      if (!record) {
        record = createRecord("ROUTES", {
          RouteName: name,
          VehicleID: vehicle.ID,
          DriverID: drivers[index].ID,
          Capacity: vehicle.Capacity,
          CurrentStudents: 3,
          Status: "Active",
          StartTime: "06:30",
          EndTime: "07:30",
          Distance: 12 + index * 2,
          Duration: 45 + index * 3
        });
        result.created.routes++;
      }
      return record;
    });
  } catch (error) {
    Logger.log("Erro em createSyntheticRoutes_: " + error.message);
    throw error;
  }
}

function createSyntheticStudents_(schools, routes, result) {
  try {
    const firstNames = [
      "Ana", "Bruno", "Camila", "Daniel", "Eduarda",
      "Felipe", "Gabriela", "Henrique", "Isabela", "Joao",
      "Karen", "Lucas", "Mariana", "Nicolas", "Olivia"
    ];
    const lastNames = [
      "Silva", "Santos", "Oliveira", "Souza", "Ferreira",
      "Alves", "Pereira", "Lima", "Costa", "Ribeiro",
      "Martins", "Carvalho", "Gomes", "Rocha", "Mendes"
    ];

    return firstNames.map(function(firstName, index) {
      const enrollment = "MAT-DEMO-" + String(index + 1).padStart(4, "0");
      const school = schools[index % schools.length];
      const route = routes[index % routes.length];
      let record = findRecordByField_("STUDENTS", "EnrollmentNumber", enrollment);

      if (!record) {
        record = createRecord("STUDENTS", {
          Name: firstName + " " + lastNames[index],
          EnrollmentNumber: enrollment,
          SchoolID: school.ID,
          School: school.Name,
          Address: "Endereco demonstrativo " + (index + 1) + ", DF",
          Latitude: -15.80 - index * 0.004,
          Longitude: -48.02 - index * 0.004,
          AccessibilityNeeds: index === 4 ? "Mobilidade reduzida" : "",
          MedicalConditions: index === 8 ? "Alergia alimentar" : "",
          RouteID: route.ID,
          FamilyContact: "Responsavel " + (index + 1),
          FamilyPhone: "(61) 98880-" + String(2100 + index),
          Status: "Active"
        });
        result.created.students++;
      }
      return record;
    });
  } catch (error) {
    Logger.log("Erro em createSyntheticStudents_: " + error.message);
    throw error;
  }
}

function createSyntheticStopPoints_(routes, result) {
  try {
    routes.forEach(function(route, routeIndex) {
      for (let order = 1; order <= 2; order++) {
        const address = "Parada demo " + route.ID + "-" + order;
        const existing = getAllRecords("STOP_POINTS").some(function(point) {
          return String(point.RouteID) === String(route.ID) && Number(point.Order) === order;
        });
        if (!existing) {
          createRecord("STOP_POINTS", {
            RouteID: route.ID,
            Address: address,
            Latitude: -15.81 - routeIndex * 0.01 - order * 0.002,
            Longitude: -48.03 - routeIndex * 0.01 - order * 0.002,
            Order: order,
            ArrivalTime: order === 1 ? "06:40" : "06:55",
            DepartureTime: order === 1 ? "06:42" : "06:57"
          });
          result.created.stopPoints++;
        }
      }
    });
  } catch (error) {
    Logger.log("Erro em createSyntheticStopPoints_: " + error.message);
    throw error;
  }
}

function createSyntheticTripsAndAttendance_(routes, students, result) {
  try {
    const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");

    routes.forEach(function(route) {
      let trip = getAllRecords("TRIPS").find(function(record) {
        return String(record.RouteID) === String(route.ID) &&
          String(record.TripDate) === today &&
          record.TripType === "Ida";
      });

      if (!trip) {
        trip = createRecord("TRIPS", {
          RouteID: route.ID,
          VehicleID: route.VehicleID,
          DriverID: route.DriverID,
          TripDate: today,
          TripType: "Ida",
          StartTime: "06:30",
          EndTime: "07:30",
          StudentsCount: 3,
          Status: "Completed"
        });
        result.created.trips++;
      }

      students.filter(function(student) {
        return String(student.RouteID) === String(route.ID);
      }).forEach(function(student, index) {
        const existing = getAllRecords("ATTENDANCE").some(function(record) {
          return String(record.StudentID) === String(student.ID) &&
            String(record.AttendanceDate) === today &&
            record.TripType === "Ida";
        });
        if (!existing) {
          createRecord("ATTENDANCE", {
            StudentID: student.ID,
            RouteID: route.ID,
            TripID: trip.ID,
            AttendanceDate: today,
            TripType: "Ida",
            Status: index === 2 ? "Absent" : "Present",
            IncidentDetails: index === 2 ? "Ausencia sintetica para demonstracao" : "",
            RecordedBy: "monitor" + String(routes.indexOf(route) + 1).padStart(2, "0")
          });
          result.created.attendance++;
        }
      });
    });
  } catch (error) {
    Logger.log("Erro em createSyntheticTripsAndAttendance_: " + error.message);
    throw error;
  }
}

function findRecordByField_(entityName, fieldName, value) {
  try {
    return getAllRecords(entityName).find(function(record) {
      return String(record[fieldName] || "").trim().toLowerCase() ===
        String(value || "").trim().toLowerCase();
    }) || null;
  } catch (error) {
    Logger.log("Erro em findRecordByField_: " + error.message);
    throw error;
  }
}
