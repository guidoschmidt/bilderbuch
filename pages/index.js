import { useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Layout } from "../components/components";
// SVG
import IconPlus from "../svg/+.svg";
import IconX from "../svg/x.svg";
// Style
import styles from "./index.module.scss";

const Collections = ({ collections }) => {
  const [showModal, setShowModal] = useState(false);
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
    if (res.status === 200) {
      setShowModal(false);
    }
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
      <h1 className={styles.logoTitle}>.bilderbuch</h1>
      <h4 className={styles.subheading}>Collections</h4>
      <div className={styles.collections}>
        {collections.map((c) => {
          return (
            <Link href={`/collections/${c.collectionName}`} key={c}>
              <div className={styles.collectionCard}>
                <header>
                  <h4>{c.collectionName}</h4>
                  <button
                    className={styles.buttonDeleteCollection}
                    onClick={() => postDeleteCollection(c.collectionName)}
                  >
                    <IconX />
                  </button>
                  <small className={styles.pictureCount}>
                    {c.imageCount} {c.imageCount === 1 ? "picture" : "pictures"}
                  </small>
                </header>
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
              </div>
            </Link>
          );
        })}
      </div>

      <button className={styles.buttonAdd} onClick={() => setShowModal(true)}>
        <IconPlus />
      </button>

      {showModal && (
        <div className={styles.modalCreate}>
          <label htmlFor="new-collection" className={styles.newCollectionTitle}>
            New Collection
          </label>
          <input
            className={styles.newCollectionNameInput}
            name="new-collection"
            type="text"
            ref={newCollectionNameRef}
          />

          <div className={styles.modalCreatActions}>
            <button onClick={() => setShowModal(false)}>Abort</button>
            <button onClick={postNewCollection}>Create</button>
          </div>
        </div>
      )}
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
