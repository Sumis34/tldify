import { NextPage } from "next";
import Head from "next/head";
import { ChangeEventHandler, useEffect, useState } from "react";
import { HiOutlineExternalLink } from "react-icons/hi";
import { trpc } from "../utils/trpc";

const TLD_URL = "https://data.iana.org/TLD/tlds-alpha-by-domain.txt";

const goDaddyLink = (domain: string) => {
  const [name, tld] = domain.split(".");

  const url = `https://godaddy.com/domainsearch/find?&tld=.${tld}&domainToCheck=${name}`;

  return url;
};

interface Domain {
  fqdn: string;
  tld: string;
  isLoading: boolean;
  available: boolean;
}

const Tldify: NextPage = () => {
  const [tlds, setTlds] = useState<string[]>();
  const [input, setInput] = useState("");
  const [domains, setDomains] = useState<Domain[]>();
  const [lastUpdated, setLastUpdated] = useState("");

  const domainMutation = trpc.domain.exists.useMutation();

  const getTld = async () => {
    const res = await fetch(TLD_URL);
    const text = await res.text();

    const tlds = text.split("\n");

    tlds.shift();

    setLastUpdated(res.headers.get("last-modified") || "");
    setTlds(tlds.filter((d) => d.length > 0));
  };

  const handleInput: ChangeEventHandler<HTMLInputElement> = (event) => {
    const val = event.target.value;
    const reg = /^[a-zA-Z0-9\-]{0,63}$/;
    if (val.match(reg)) setInput(val.toLowerCase());
  };

  useEffect(() => {
    getTld();
  }, []);

  useEffect(() => {
    const matchingTlds = tlds?.filter((tld) =>
      input.toUpperCase().endsWith(tld)
    );

    const domains = matchingTlds?.map(
      (tld) =>
        ({
          fqdn:
            input.toUpperCase() === tld
              ? input + "." + tld.toLowerCase()
              : input.replace(
                  new RegExp(tld.toLowerCase() + "$"),
                  "." + tld.toLowerCase()
                ),
          tld,
          isLoading: true,
          available: false,
        } as Domain)
    );

    setDomains(domains || []);

    if (!domains) return;
    // domainMutation.mutate({ domains: domains.map((d) => d.fqdn) });
  }, [input]);

  return (
    <main
      className="p-5 relative flex h-screen w-screen items-center justify-center overflow-hidden bg-black before:absolute before:aspect-square before:w-96 before:origin-center before:scale-150 before:rounded-full before:bg-black before:opacity-50 before:blur-xl"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%234f66d9' fill-opacity='0.5'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    >
      <Head>
        <title>TLDify</title>
        <link rel="icon" type="image/x-icon" href="TLDify_fav.png"></link>
      </Head>
      <div className="z-10 flex flex-col">
        <h1 className="mb-5 text-center text-7xl font-bold text-white">
          TLDify
        </h1>

        <div className="rounded-lg border-2 border-indigo-500 bg-black px-3 py-2 text-gray-200">
          <p>Enter your beloved Hostname and we will find a TLD for you.</p>
        </div>

        <div className="relative mt-3 w-full">
          <input
            placeholder="google"
            pattern=""
            className="w-full rounded-lg py-2 px-3 text-xl font-bold invalid:outline-2 focus-visible:outline-none"
            type="text"
            value={input}
            onChange={handleInput}
          />
          {input && (
            <ul className="absolute mt-2 w-full divide-y divide-gray-300 overflow-hidden rounded-lg bg-gray-100 py-1">
              {domains && domains?.length > 0 ? (
                domains.map(({ fqdn }) => (
                  <li
                    className="group flex w-full items-center gap-2 hover:bg-gray-200"
                    key={fqdn}
                  >
                    <a
                      className="inline-block w-full px-3 py-2"
                      href={goDaddyLink(fqdn)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {fqdn}
                    </a>
                    <HiOutlineExternalLink className="mr-3 translate-x-4 text-2xl opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                  </li>
                ))
              ) : (
                <p className="py-1 px-3 text-sm opacity-70">no matching tld</p>
              )}
            </ul>
          )}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 m-4 rounded-md bg-black px-2 py-1 text-sm text-neutral-500">
        TLD{"'s"} updated at {lastUpdated}
      </div>
    </main>
  );
};

export default Tldify;
