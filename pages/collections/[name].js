import { useRouter } from "next/router";

const Collection = ({ images }) => {
  const router = useRouter();
  const { name } = router.query;

  return (
    <p>
      Collection: {name}
      <div className="images">
        {images.map((i) => {
          return (
            <img
              alt=""
              src={`/collections/Test/${i}`}
              width="200"
              height="200"
            />
          );
        })}
      </div>
    </p>
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
