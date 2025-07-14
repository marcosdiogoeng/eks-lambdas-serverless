const {
  RDSClient,
  DescribeDBInstancesCommand,
  StopDBInstanceCommand,
  StartDBInstanceCommand,
  ListTagsForResourceCommand,
} = require("@aws-sdk/client-rds");

const client = new RDSClient({ region: process.env.AWS_REGION || "us-east-1" });

exports.handler = async (event) => {
  const action = event.action;
  const validActions = ["stop", "start"];

  if (!validActions.includes(action)) {
    console.warn(`Ação inválida recebida: ${action}`);
    return { statusCode: 400, body: `Ação inválida: ${action}` };
  }

  const shouldStop = action === "stop";
  let matchedInstances = [];

  try {
    const dbs = await client.send(new DescribeDBInstancesCommand({}));
    const instances = dbs.DBInstances || [];

    for (const db of instances) {
      const arn = db.DBInstanceArn;
      const tagsResp = await client.send(
        new ListTagsForResourceCommand({ ResourceName: arn })
      );
      const tags = tagsResp.TagList || [];

      const hasStopTag = tags.some(
        (tag) => tag.Key === "stop" && tag.Value === "yes"
      );
      if (!hasStopTag) continue;

      matchedInstances.push(db);
    }

    if (matchedInstances.length === 0) {
      console.log("Nenhuma instância RDS com tag stop=yes encontrada.");
      return {
        statusCode: 200,
        body: "Nenhuma instância com tag 'stop=yes' para processar.",
      };
    }

    for (const db of matchedInstances) {
      const status = db.DBInstanceStatus;
      const id = db.DBInstanceIdentifier;

      if (shouldStop && status === "available") {
        console.log(`Parando instância: ${id}`);
        await client.send(new StopDBInstanceCommand({ DBInstanceIdentifier: id }));
      } else if (!shouldStop && status === "stopped") {
        console.log(`Iniciando instância: ${id}`);
        await client.send(new StartDBInstanceCommand({ DBInstanceIdentifier: id }));
      } else {
        console.log(`Instância ${id} já está no estado correto: ${status}`);
      }
    }

    return {
      statusCode: 200,
      body: `${matchedInstances.length} instância(s) com tag 'stop=yes' processadas.`,
    };
  } catch (err) {
    console.error("Erro ao processar instâncias RDS:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
