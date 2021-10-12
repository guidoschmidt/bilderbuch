import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { LoadingIndicator, Layout } from "../../components/components";
import styles from "./collections.module.scss";
import IconX from "../../svg/x.svg";
import IconBack from "../../svg/back.svg";
import IconDownload from "../../svg/download.svg";

const Collection = ({ images }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingDownload, setIsProcessingDownload] = useState(false);
  const router = useRouter();
  const { name } = router.query;

  const refresh = () => {
    router.replace(router.asPath);
  };

  const requestDownload = async (name) => {
    setIsProcessingDownload(true);
    const res = await fetch(`/api/collections/${name}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (res.status === 200) {
      const json = await res.json();
      console.log(json.link);
      const downloadLink = document.createElement("a");
      downloadLink.download = `${name}.zip`;
      downloadLink.href = json.link;
      downloadLink.click();
      downloadLink.remove();
    }
    setIsProcessingDownload(false);
  };

  const postDeleteImage = async (image) => {
    setIsLoading(true);
    const res = await fetch(`/api/collections/${name}`, {
      method: "DELETE",
      body: JSON.stringify({ image: image }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    refresh();
    setIsLoading(false);
  };

  const postSaveImageDataFromUrl = async (url) => {
    if (url.length === 0) return;
    setIsLoading(true);
    const res = await fetch(`/api/collections/${name}`, {
      method: "POST",
      body: JSON.stringify({ imageUrl: url }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    refresh();
    setIsLoading(false);
  };

  const onPaste = (e) => {
    // Stop data actually being pasted into div
    e.stopPropagation();
    e.preventDefault();
    // Get pasted data via clipboard API
    const clipboardData = e.clipboardData || window.clipboardData;
    const pastedData = clipboardData.getData("Text");
    postSaveImageDataFromUrl(pastedData);
  };

  useEffect(() => {
    window.addEventListener("paste", onPaste, false);
    return () => {
      window.removeEventListener("paste", onPaste, false);
    };
  }, []);

  return (
    <Layout
      onDragEnter={(e) => {
        e.preventDefault();
        console.log("Drag Start");
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        console.log("Drag Leave");
      }}
      onDragOver={(e) => {
        e.preventDefault();
        console.log("Drag Over");
      }}
      onDrop={(e) => {
        e.preventDefault();
        console.log("Drop");
      }}
    >
      <header className={styles.header}>
        <Link href="/">
          <button className={styles.backButton}>
            <IconBack />
          </button>
        </Link>
        <div>
          <h4>Collection</h4>
          <h2 className={styles.collectionNamen}>{name}</h2>
          <h5 className={styles.pictureCount}>
            {images.length} {images.length === 1 ? "Picture" : "Pictures"}
          </h5>
        </div>
        <div className={styles.actions}>
          <button
            disabled={isProcessingDownload}
            className={styles.downloadButton}
            onClick={() => requestDownload(name)}
          >
            <IconDownload />
          </button>
        </div>
      </header>

      {images.length === 0 && (
        <h4>
          Use <code>Ctrl/Cmd + v</code> to paste image urls
        </h4>
      )}

      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <div className={styles.images}>
          {images.map((i) => {
            return (
              <div key={i} className={styles.imageContainer}>
                <img
                  className={styles.image}
                  src={`/collections/${name}/${i}`}
                />
                <button
                  className={styles.deleteButton}
                  onClick={() => postDeleteImage(i)}
                >
                  <IconX />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
};

export async function getServerSideProps(context) {
  const fs = require("fs");
  const { name } = context.query;
  return {
    props: {
      images: fs
        .readdirSync(`public/collections/${name}/`)
        .filter((f) => ![".DS_Store"].includes(f))
        .filter((f) => f.match(/.json/) === null),
    },
  };
}

export default Collection;
