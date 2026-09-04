export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { seedAdminUser } = await import("./lib/seed");

    try {
      await seedAdminUser();
    } catch (err) {
      console.error("Startup admin seed failed:", err);
    }
  }
}