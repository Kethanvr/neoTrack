import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "NeoTrace AI",
    description: "A private, user-controlled browser activity journal.",
    version: "0.1.0",
    permissions: ["tabs", "storage", "idle", "alarms"],
    optional_permissions: ["scripting"],
    optional_host_permissions: ["http://*/*", "https://*/*"],
    action: { default_title: "NeoTrace AI" },
  },
});

