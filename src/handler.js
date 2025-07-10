const {
  AutoScalingClient,
  DescribeAutoScalingGroupsCommand,
  UpdateAutoScalingGroupCommand,
} = require("@aws-sdk/client-auto-scaling");

const REGION = process.env.AWS_REGION || "us-east-1";
const client = new AutoScalingClient({ region: REGION });

// Ajuste esse valor conforme a quantidade desejada ao escalar para cima
const SCALE_UP_DESIRED_CAPACITY = 3;

exports.handler = async (event) => {
  const action = event.action;
  console.log("Ação recebida:", action);

  if (action !== "scaleDown" && action !== "scaleUp") {
    console.log("Ação inválida:", action);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Ação inválida" }),
    };
  }

  try {
    // 1. Listar todos os ASGs
    const asgsResponse = await client.send(new DescribeAutoScalingGroupsCommand({}));
    const asgs = asgsResponse.AutoScalingGroups || [];

    // 2. Filtrar ASGs que tenham a tag stop=yes
    const filteredASGs = asgs.filter(asg => {
      return asg.Tags && asg.Tags.some(tag => tag.Key === "stop" && tag.Value === "yes");
    });

    if (filteredASGs.length === 0) {
      console.log("Nenhum ASG com tag stop=yes encontrado.");
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Nenhum ASG com tag stop=yes encontrado." }),
      };
    }

    // 3. Para cada ASG filtrado, atualize a desiredCapacity
    for (const asg of filteredASGs) {
      const desiredCapacity = action === "scaleDown" ? 0 : SCALE_UP_DESIRED_CAPACITY;

      console.log(`Atualizando ASG ${asg.AutoScalingGroupName} para desiredCapacity = ${desiredCapacity}`);

      await client.send(new UpdateAutoScalingGroupCommand({
        AutoScalingGroupName: asg.AutoScalingGroupName,
        DesiredCapacity: desiredCapacity,
      }));

      console.log(`ASG ${asg.AutoScalingGroupName} atualizado com sucesso.`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `ASGs atualizados para ação ${action}` }),
    };

  } catch (error) {
    console.error("Erro ao escalar ASGs:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Erro ao escalar ASGs", error: error.message }),
    };
  }
};
