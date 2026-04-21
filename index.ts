import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as fs from "fs";
import * as path from "path";

const env = pulumi.getStack();
const project = pulumi.getProject();
const config = new pulumi.Config();
const tags = {
    "author": config.require("author"),
    "pulumiStack": env,
    "pulumiRepo": project,
    "deployment": "pulumi",
    "org": config.require("org"),
};

const awsConfig = new pulumi.Config("aws");
const region = awsConfig.require("region");

// --- SSH access ---

// Auto-generated key pair. Retrieve the private key after deploy:
//   pulumi stack output privateKey --show-secrets > openclaw.pem
//   chmod 600 openclaw.pem
//   ssh -i openclaw.pem ubuntu@$(pulumi stack output publicIp)
const keyPair = new aws.lightsail.KeyPair("openclaw-key", {
    name: "openclaw-key",
    tags: tags,
});

// --- Lightsail instance ---

const bootstrapScript = fs.readFileSync(
    path.join(__dirname, "scripts", "bootstrap.sh"),
    "utf-8",
);

const instance = new aws.lightsail.Instance("openclaw", {
    name: "openclaw",
    availabilityZone: `${region}a`,
    blueprintId: "ubuntu_22_04",
    // small_3_0: 2 vCPU, 2 GB RAM, 60 GB SSD — ~$10/month
    bundleId: "small_3_0",
    keyPairName: keyPair.name,
    userData: bootstrapScript,
    tags: tags,
});

// --- Networking ---

// Static IP keeps the outbound address consistent across stops/starts.
// Free when attached to a running instance.
const staticIp = new aws.lightsail.StaticIp("openclaw-ip", {
    name: "openclaw-ip",
});

new aws.lightsail.StaticIpAttachment("openclaw-ip-attachment", {
    staticIpName: staticIp.name,
    instanceName: instance.name,
});

// Firewall: SSH only. Key-based auth provides security; no IP restriction
// since the user's IP changes.
new aws.lightsail.InstancePublicPorts("openclaw-ports", {
    instanceName: instance.name,
    portInfos: [{
        protocol: "tcp",
        fromPort: 22,
        toPort: 22,
        cidrs: ["0.0.0.0/0"],
    }],
});

// TODO: S3 bucket + synced-folder for openclaw config-as-code (config/ directory)

// --- Exports ---

export const instanceName = instance.name;
export const publicIp = staticIp.ipAddress;
export const privateKey = pulumi.secret(keyPair.privateKey);
