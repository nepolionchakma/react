import { MailPlus } from "lucide-react";
import ComposeButton from "./ComposeButton";
import NotificationCard from "./NotificationCard";
import RecycleBinTable from "./RecycleBinTable";
import { useState } from "react";

const RecycleBin = () => {
  const [showModal, setShowModal] = useState(false);
  return (
    <div>
      <NotificationCard />
      <RecycleBinTable path="Recycle Bin" person="From/To" />
      <button
        className="bg-black px-4 py-2 rounded-md hover:bg-black/80 text-white fixed bottom-3 flex gap-1"
        onClick={() => setShowModal(true)}
      >
        <MailPlus />
        <p>Compose</p>
      </button>
      {showModal && <ComposeButton setShowModal={setShowModal} />}
    </div>
  );
};
export default RecycleBin;
