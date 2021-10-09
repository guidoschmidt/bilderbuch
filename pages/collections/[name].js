import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "./collections.module.scss";

const Collection = ({ images }) => {
  const router = useRouter();
  const { name } = router.query;

  const refresh = () => {
    router.replace(router.asPath);
  };

  const postDeleteImage = async (image) => {
    const res = await fetch(`/api/collections/${name}`, {
      method: "DELETE",
      body: JSON.stringify({ image: image }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    refresh();
  };

  const postSaveImageDataFromUrl = async (url) => {
    if (url.length === 0) return;
    const res = await fetch(`/api/collections/${name}`, {
      method: "POST",
      body: JSON.stringify({ imageUrl: url }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    refresh();
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
    <div
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
      <Link href="/">
        <button>Back</button>
      </Link>
      <h2>
        Collection: {name}{" "}
        <button
          onClick={() => {
            alert("Bearbeiten");
          }}
        >
          …
        </button>
      </h2>
      <h3>{images.length} Pictures</h3>

      {images.length === 0 && (
        <h4>
          Use <code>Ctrl/Cmd + v</code> to paste image urls
        </h4>
      )}

      <div className={styles.images}>
        {images.map((i) => {
          return (
            <div key={i} className={styles.imageContainer}>
              <img className={styles.image} src={`/collections/${name}/${i}`} />
              <button
                className={styles.deleteButton}
                onClick={() => postDeleteImage(i)}
              >
                X
              </button>
            </div>
          );
        })}
      </div>
    </div>
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
