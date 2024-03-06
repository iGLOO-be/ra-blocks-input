import { DataProvider, LegacyDataProvider } from "ra-core";
import jsonServerProvider from "ra-data-json-server";
import fakeDataProvider from "ra-data-fakerest";

const dataProviderJsonServer = jsonServerProvider(
  "https://jsonplaceholder.typicode.com"
);

const dataProviderMethods = [
  "getList",
  "getOne",
  "getMany",
  "getManyReference",
  "create",
  "update",
  "updateMany",
  "delete",
  "deleteMany",
];

const dataProviderSwitcher = (
  providerByResource: { [k: string]: DataProvider },
  defaultProvider: DataProvider
): LegacyDataProvider =>
  dataProviderMethods.reduce((res, methodName) => {
    const provider: LegacyDataProvider = (resource, ...args) => {
      const provider = providerByResource[resource]
        ? providerByResource[resource]
        : defaultProvider;
      return provider[methodName](resource, ...args);
    };
    res[methodName] = provider;
    return res;
  }, {} as any) as LegacyDataProvider;

const fakeProvider = fakeDataProvider({
  pages: [
    { id: 0, name: "example", blocks: "[]" },
    { id: 1, name: "example2" },
  ],
});

export const dataProvider = dataProviderSwitcher(
  {
    pages: fakeProvider,
  },
  dataProviderJsonServer
);
