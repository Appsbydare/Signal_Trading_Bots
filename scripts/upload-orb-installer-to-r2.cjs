/**
 * Upload the ORB installer to Cloudflare R2 (same bucket as Telegram; different object key).
 *
 * Usage (from repo root, with R2_* env in .env):
 *   node scripts/upload-orb-installer-to-r2.cjs [path-to-exe]
 *
 * Optional: set R2_ORB_EXE_FILE_NAME to change the object key (default ORB_Bot_Setup_V1.1.exe).
 */
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

async function main() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const endpoint = process.env.R2_ENDPOINT;
  const bucket = process.env.R2_BUCKET_NAME || "release";
  const key =
    process.env.R2_ORB_EXE_FILE_NAME || "ORB_Bot_Setup_V1.1.exe";

  if (!accountId || !accessKeyId || !secretAccessKey || !endpoint) {
    console.error(
      "Missing R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, or R2_ENDPOINT in environment."
    );
    process.exit(1);
  }

  const localPath =
    process.argv[2] ||
    path.join("C:", "Projects", "ORB_Bot", "Exe", "Setup", "ORB_Bot_Setup_V1.1.exe");

  if (!fs.existsSync(localPath)) {
    console.error("File not found:", localPath);
    console.error("Pass the full path to the .exe as the first argument.");
    process.exit(1);
  }

  const body = fs.readFileSync(localPath);
  const client = new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: "application/vnd.microsoft.portable-executable",
    })
  );

  console.log(`Uploaded ${localPath} → r2://${bucket}/${key}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
