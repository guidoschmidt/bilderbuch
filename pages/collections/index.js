import { useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

const Collections = ({ collections }) => {
  const router = useRouter();

  const newCollectionNameRef = useRef();

  const refresh = () => {
    router.replace(router.asPath);
  };

  const postNewCollection = async () => {
    const { value } = newCollectionNameRef.current;
    const payload = { name: value };
    const res = await fetch(`/api/collection`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });
    refresh();
  };

  return (
    <div>
      <h1>Collections</h1>
      <ul>
        {collections.map((c) => {
          return (
            <li>
              <Link href={`/collections/${c}`} key={c}>
                {c}
              </Link>
            </li>
          );
        })}
      </ul>

      <div>
        <label htmlFor="new-collection">New Collection</label>
        <input name="new-collection" type="text" ref={newCollectionNameRef} />
        <button onClick={postNewCollection}>Add</button>
      </div>
    </div>
  );
};

export async function getServerSideProps() {
  const fs = require("fs");
  return { props: { collections: fs.readdirSync("public/collections/") } };
}

export default Collections;
