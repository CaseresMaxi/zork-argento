const azdev = require("azure-devops-node-api");

async function testAzureDevOpsConnection() {
  try {
    const orgUrl = process.env.AZURE_DEVOPS_ORG_URL || "https://dev.azure.com/zork-argento";
    const token = process.env.AZURE_DEVOPS_PAT || "YOUR_PAT_TOKEN_HERE";
    const project = process.env.AZURE_DEVOPS_PROJECT || "zork-argento";

    console.log("🔍 Probando conexión con Azure DevOps...");
    console.log(`📍 Organización: ${orgUrl}`);
    console.log(`📍 Proyecto: ${project}`);

    // Crear conexión autenticada
    const authHandler = azdev.getPersonalAccessTokenHandler(token);
    const connection = new azdev.WebApi(orgUrl, authHandler);

    // Obtener API de Work Items
    const workItemApi = await connection.getWorkItemTrackingApi();

    // Probar obtener algunos work items
    console.log("📋 Obteniendo work items...");
    
    const queryResult = await workItemApi.queryByWiql({
      query: `SELECT [System.Id], [System.Title], [System.State] FROM WorkItems WHERE [System.TeamProject] = '${project}' ORDER BY [System.Id] DESC`
    });

    let workItems = [];
    if (queryResult.workItems && queryResult.workItems.length > 0) {
      const ids = queryResult.workItems.slice(0, 5).map(wi => wi.id);
      workItems = await workItemApi.getWorkItems(ids);
    }

    if (workItems.length > 0) {
      console.log("✅ Conexión exitosa! Work items encontrados:");
      workItems.forEach(item => {
        console.log(`  - ID: ${item.id}, Título: ${item.fields['System.Title']}, Estado: ${item.fields['System.State']}`);
      });
    } else {
      console.log("⚠️  Conexión establecida, pero no se encontraron work items");
    }

    // Probar obtener builds
    console.log("\n🏗️  Probando conexión con builds...");
    const buildApi = await connection.getBuildApi();
    const builds = await buildApi.getBuilds(project, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 5);
    
    if (builds.length > 0) {
      console.log("✅ Builds encontrados:");
      builds.forEach(build => {
        console.log(`  - ID: ${build.id}, Nombre: ${build.definition?.name}, Estado: ${build.status}`);
      });
    } else {
      console.log("⚠️  No se encontraron builds recientes");
    }

    console.log("\n🎉 Prueba completada exitosamente!");
    
  } catch (error) {
    console.error("❌ Error conectando con Azure DevOps:", error.message);
    
    if (error.message?.includes("401")) {
      console.error("🔑 Error de autenticación: Verifica tu Personal Access Token");
    } else if (error.message?.includes("404")) {
      console.error("🔍 Error de proyecto: Verifica que el proyecto existe y tienes acceso");
    } else if (error.message?.includes("403")) {
      console.error("🚫 Error de permisos: Tu token necesita más permisos");
    }
  }
}

// Ejecutar si se llama directamente
testAzureDevOpsConnection();
