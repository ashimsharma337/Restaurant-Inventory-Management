import Head from "next/head";
import UsageReport from "@/components/dashboard/UsageReport";

export default function Usage() {
  return (
    <>
      <Head>
        <title>Usage / Consumption Report</title>
      </Head>
      <UsageReport />
    </>
  );
}