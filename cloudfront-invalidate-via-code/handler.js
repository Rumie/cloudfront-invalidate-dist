//
// Parts of this source code were borrowed from the AWS official documentation.
//
// REFERENCE: https://docs.aws.amazon.com/codepipeline/latest/userguide/actions-invoke-lambda-function.html#actions-invoke-lambda-function-add-action
//

const AWS = require("aws-sdk");

async function invalidate_cloudfront_distribution(
  distribution_id,
  object_paths
) {
  const cloudfront = new AWS.CloudFront();
  return cloudfront
    .createInvalidation({
      DistributionId: distribution_id,
      InvalidationBatch: {
        CallerReference: `cloudfront-invalite-dist-${new Date().getTime()}`,
        Paths: {
          Quantity: object_paths.length,
          Items: object_paths,
        },
      },
    })
    .promise();
}

async function lambda_handler(event, context) {
  var response = {};

  const distributionId = event.distributionId;
  const objectPaths = event.objectPaths;

  try {
    await invalidate_cloudfront_distribution(distributionId, objectPaths);

    const body = {
      message: "Success!",
      input: event,
    };

    response = {
      statusCode: 200,
      body: JSON.stringify(body),
    };
  } catch (ex) {
    // If any exception is raised, fail the job and log the exception message.
    console.error("Function failed due to exception.");
    console.error(ex);

    const body = {
      message: JSON.stringify(ex),
      input: event,
    };

    response = {
      statusCode: 500,
      body: JSON.stringify(body),
    };
  }

  return response;
}

exports.handler = lambda_handler;
