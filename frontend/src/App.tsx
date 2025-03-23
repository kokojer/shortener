import "./App.css";
import { Flex, Tabs } from "@chakra-ui/react";
import ShortLinkForm from "@/components/ShortLinkForm.tsx";
import DeleteLinkForm from "@/components/DeleteLinkForm.tsx";
import InfoLinkForm from "@/components/InfoLinkForm.tsx";
import AnalyticsLinkForm from "@/components/AnalyticsLinkForm.tsx";

function App() {
  return (
    <Flex direction="column" gap={6}>
      <h1>Shortener</h1>
      <Tabs.Root defaultValue="shorten" justify="start">
        <Tabs.List gap={4}>
          <Tabs.Trigger value="shorten">Сократить ссылку</Tabs.Trigger>
          <Tabs.Trigger value="delete">Удалить ссылку</Tabs.Trigger>
          <Tabs.Trigger value="info">Получить информацию о ссылке</Tabs.Trigger>
          <Tabs.Trigger value="analytics">Аналитика</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="shorten">
          <ShortLinkForm />
        </Tabs.Content>
        <Tabs.Content value="delete">
          <DeleteLinkForm />
        </Tabs.Content>
        <Tabs.Content value="info">
          <InfoLinkForm />
        </Tabs.Content>
        <Tabs.Content value="analytics">
          <AnalyticsLinkForm />
        </Tabs.Content>
      </Tabs.Root>
    </Flex>
  );
}

export default App;
