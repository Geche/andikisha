import type { Metadata } from "next";
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/reset.css";
import BootstrapJs from "../components/bootstrap-js/bootstrapjs";
import "../style/icon/boxicons/boxicons/css/boxicons.min.css";
import "../style/icon/tabler-icons/webfont/tabler-icons.css";
import "../style/icon/weather/weathericons.css";
import "../style/icon/typicons/typicons.css";
import "../style/css/fontawesome/css/fontawesome.min.css";
import "../style/css/fontawesome/css/all.min.css";
import "../style/icon/ionic/ionicons.css";
import "../style/icon/tabler-icons/webfont/tabler-icons.css";
import "../style/css/feather.css";
import "./globals.scss";

import { ReduxProvider } from "@/providers/ReduxProvider";
import ThemeInitializer from "@/core/common/ThemeInitializer";
import InitialLoader from "@/core/common/InitialLoader";

export const metadata: Metadata = {
  title: "Smarthr Admin Template",
  description: "Smarthr Admin Template",
  icons: {
    icon: "favicon.png",
    shortcut: "favicon.png", // Add shortcut icon for better support
    apple: "favicon.png", // Optional: for Apple devices (place in `public/`)
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <InitialLoader />
          <ThemeInitializer />
          {children}
          <BootstrapJs />
        </ReduxProvider>
      </body>
    </html>
  );
}
