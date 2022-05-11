"use strict";
var __createBinding =
    (this && this.__createBinding) ||
    (Object.create
        ? function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              Object.defineProperty(o, k2, {
                  enumerable: true,
                  get: function () {
                      return m[k];
                  }
              });
          }
        : function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              o[k2] = m[k];
          });
var __setModuleDefault =
    (this && this.__setModuleDefault) ||
    (Object.create
        ? function (o, v) {
              Object.defineProperty(o, "default", { enumerable: true, value: v });
          }
        : function (o, v) {
              o["default"] = v;
          });
var __importStar =
    (this && this.__importStar) ||
    function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null)
            for (var k in mod)
                if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    };
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPackageInfo = void 0;
const path_1 = require("path");
const promises_1 = require("fs/promises");
async function getPackageInfo(path) {
    const pkgPath = (0, path_1.join)(path, `package.json`);
    try {
        await (0, promises_1.access)(pkgPath);
        const { name, widgetName, moduleName, version, marketplace, testProject, repository } =
            await Promise.resolve().then(() => __importStar(require(pkgPath)));
        return {
            nameWithDash: name,
            nameWithSpace: moduleName ?? widgetName,
            version,
            minimumMXVersion: ensureVersion(marketplace?.minimumMXVersion),
            url: repository?.url,
            testProjectUrl: testProject?.githubUrl,
            testProjectBranchName: testProject?.branchName,
            changelogPath: `${path}/CHANGELOG.md`
        };
    } catch (error) {
        console.error(`ERROR: Path does not exist: ${pkgPath}`);
        return undefined;
    }
}
exports.getPackageInfo = getPackageInfo;
function ensureVersion(version) {
    if (version && /\d+\.\d+\.\d+/.test(version)) {
        return version;
    }
    throw new Error(`Unknown version format '${version}'`);
}
