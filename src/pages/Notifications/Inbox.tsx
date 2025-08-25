import { useState } from "react";
import ComposeButton from "./ComposeButton";
import NotificationCard from "./NotificationCard";
import NotificationTable from "./NotificationTable";
import { MailPlus } from "lucide-react";

const Inbox = () => {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <NotificationCard />
      <NotificationTable path="Inbox" person="From" />
      <button
        className="bg-black px-4 py-2 rounded-md hover:bg-black/80 text-white fixed bottom-3 flex gap-1"
        onClick={() => setShowModal(true)}
      >
        <MailPlus />
        <p>Compose</p>
      </button>
      {showModal && <ComposeButton setShowModal={setShowModal} />}
    </>
  );
};

export default Inbox;
