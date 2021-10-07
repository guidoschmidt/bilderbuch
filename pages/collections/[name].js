import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

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

  useEffect(() => {
    const pasteListener = window.addEventListener("paste", (e) => {
      // Stop data actually being pasted into div
      e.stopPropagation();
      e.preventDefault();
      // Get pasted data via clipboard API
      const clipboardData = e.clipboardData || window.clipboardData;
      const pastedData = clipboardData.getData("Text");
      // if (e.key === "v" && e.metaKey) console.log(e);
      postSaveImageDataFromUrl(pastedData);
    });
    return () => {
      window.removeEventListener("paste", pasteListener);
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
      <Link href="/">Zurück</Link>
      <h2>Collection: {name}</h2>
      <div className="images">
        {images.map((i) => {
          return (
            <div key={i}>
              <img
                alt=""
                src={`/collections/Test/${i}`}
                width="200"
                height="200"
              />
              <button onClick={() => postDeleteImage(i)}>X</button>
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
        .filter((f) => ![".DS_Store"].includes(f)),
    },
  };
}

export default Collection;
