import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { postData } from "@/Utility/funtion";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

function NewUserInvitation() {
  const { token, enterpriseSetting } = useGlobalContext();
  const [invitaionType, setInvitaionType] = useState("email");
  const [isCopyURL, setIsCopyURL] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const nodeUrl = import.meta.env.VITE_NODE_ENDPOINT_URL;
  // const flaskUrl = import.meta.env.VITE_FLASK_ENDPOINT_URL;

  const invitaionSchema = z.object({
    email: z.string().email("Invalid email"),
  });
  const form = useForm<z.infer<typeof invitaionSchema>>({
    resolver: zodResolver(invitaionSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof invitaionSchema>) => {
    const postParams = {
      baseURL: nodeUrl,
      url: "/invitation/via-email",
      setLoading: setIsLoading,
      payload: {
        invited_by: token.user_id,
        email: data.email,
        tenant_id: enterpriseSetting?.tenant_id,
        user_invitation_validity: enterpriseSetting?.user_invitation_validity,
      },
      isConsole: true,
    };

    const res = await postData(postParams);

    if (res.status === 200 || res.status === 201) {
      toast({ description: res.data.message });
    } else {
      setGeneratedLink(null);
      toast({ description: res });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink ?? "").then(
      () => {
        setIsCopyURL(true);
        toast({ description: `Text copied to clipboard! ${generatedLink}` });
      },
      (err) => {
        setIsCopyURL(false);
        toast({ description: "Failed to copy text!" });
        console.error("Error copying text: ", err);
      }
    );
  };

  const handleGenerateLink = async () => {
    const postParams = {
      baseURL: nodeUrl,
      url: "/invitation/via-link",
      setLoading: setIsLoading,
      payload: {
        invited_by: token.user_id,
        tenant_id: enterpriseSetting?.tenant_id,
        user_invitation_validity: enterpriseSetting?.user_invitation_validity,
      },
    };

    const res = await postData(postParams);

    if (res.status === 200 || res.status === 201) {
      setGeneratedLink(res.data.invitation_link);
      toast({ description: res.data.message });
      setIsCopyURL(false);
    } else {
      setGeneratedLink(null);
      toast({ description: res });
    }
  };
  return (
    <div className="mx-auto w-1/2 h-1/2 mt-16">
      <div className="flex flex-col p-4 gap-4">
        <h4>
          {
            {
              email:
                "When invite a user to join your organization, they will receive an email with a link to complete their registration. This allows them to quickly gain access to your organization’s resources and collaborate with the team.",
              link: "By entering the link, recipient can complete his/her registration and gain immediate access to your organization’s resources, ensuring a smooth onboarding process.",
            }[invitaionType]
          }
        </h4>
        <div className="flex gap-2 bg-slate-100 rounded">
          <button
            onClick={() => {
              setInvitaionType("email");
            }}
            className={`p-2 ${
              invitaionType === "email" ? "bg-white rounded m-1" : "m-1"
            }`}
          >
            Invite with email
          </button>
          <button
            onClick={() => {
              setInvitaionType("link");
            }}
            className={`p-2 ${
              invitaionType === "link" ? "bg-white rounded m-1" : "m-1"
            }`}
          >
            Invite with link
          </button>
        </div>
        <>
          {
            {
              email: (
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-4"
                >
                  <div className="flex gap-2">
                    <div className="pr-7 w-2/3">
                      <Input
                        {...form.register("email")}
                        placeholder="Enter email address"
                        type="email"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white p-2 rounded w-1/3"
                    >
                      {isLoading ? "Sending..." : "Send Invitation"}
                    </button>
                  </div>
                </form>
              ),
              link: (
                <div className="flex gap-2">
                  <div className="relative w-2/3 pr-7">
                    <Input
                      value={generatedLink ?? ""}
                      placeholder={generatedLink ?? "Generate Link"}
                      readOnly
                    />
                    <button className="absolute right-0 top-0 bottom-0">
                      {generatedLink && (
                        <>
                          {isCopyURL ? (
                            <Check
                              onClick={handleCopy}
                              className="cursor-pointer text-green-500"
                            />
                          ) : (
                            <Copy
                              onClick={handleCopy}
                              className="cursor-pointer text-red-500"
                            />
                          )}
                        </>
                      )}
                    </button>
                  </div>
                  <button
                    className="bg-blue-600 text-white p-2 rounded w-1/3"
                    onClick={handleGenerateLink}
                  >
                    {isLoading ? "Generating..." : "Generate Link"}
                  </button>
                </div>
              ),
            }[invitaionType]
          }
        </>
      </div>
    </div>
  );
}

export default NewUserInvitation;
