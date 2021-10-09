import { useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Layout } from "../components/components";
// Style
import styles from "./index.module.scss";

const Collections = ({ collections }) => {
  const router = useRouter();

  const newCollectionNameRef = useRef();

  const refresh = () => {
    router.replace(router.asPath);
  };

  const postNewCollection = async () => {
    const { value } = newCollectionNameRef.current;
    const payload = { name: value.trim().replace(" ", "-") };
    const res = await fetch(`/api/collections`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });
    refresh();
  };

  const postDeleteCollection = async (name) => {
    const payload = { name };
    const res = await fetch(`/api/collections`, {
      method: "DELETE",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });
    refresh();
  };

  return (
    <Layout>
      <h1>.bilderbuch</h1>
      <h3>Collections</h3>
      <div className={styles.collections}>
        {collections.map((c) => {
          return (
            <Link href={`/collections/${c.collectionName}`} key={c}>
              <div className={styles.collectionCard}>
                <h4>{c.collectionName}</h4>
                <div className={styles.imageList}>
                  {c.images.map((i) => {
                    return (
                      <div className={styles.previewImageWrapper}>
                        <picutre
                          className={styles.previewImage}
                          style={{
                            backgroundImage: `url(/collections/${c.collectionName}/${i})`,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
                <small className={styles.pictureCount}>
                  {c.imageCount} pictures
                </small>
                <button
                  className="btn-delete"
                  onClick={() => postDeleteCollection(c.collectionName)}
                >
                  Delete
                </button>
              </div>
            </Link>
          );
        })}
      </div>

      <div>
        <label htmlFor="new-collection">New Collection</label>
        <input name="new-collection" type="text" ref={newCollectionNameRef} />
        <button className={styles.buttonAdd} onClick={postNewCollection}>
          Add
        </button>
      </div>
    </Layout>
  );
};

export async function getServerSideProps() {
  const fs = require("fs");
  return {
    props: {
      collections: fs
        .readdirSync("public/collections/")
        .filter((dir) => dir[0] !== ".")
        .map((collectionName) => {
          const images = fs
            .readdirSync(`public/collections/${collectionName}`)
            .filter((file) => file.match(/.DS_Store/) === null)
            .filter((file) => file.match(/.json/) === null);
          return {
            collectionName,
            imageCount: images.length,
            images: images.slice(0, 3),
          };
        }),
    },
  };
}

export default Collections;
