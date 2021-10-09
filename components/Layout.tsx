import React from "react";
// Components
import { Footer } from "./Footer";
// Style
import styles from "./Layout.module.scss";

export const Layout = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  return (
    <div className={styles.layout}>
      <main>{children}</main>
      <Footer />
    </div>
  );
};
