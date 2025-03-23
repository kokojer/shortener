import { Button, Field, Flex, Input, Table } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { axiosInstance } from "@/axios.ts";
import { AxiosError, AxiosResponse } from "axios";
import { toaster } from "@/components/ui/toaster.tsx";

interface FormValues {
  shortUrl: string;
}

interface LinkData {
  ip: string;
  clickCount: string;
}

const localesLinkDataFields: Record<keyof LinkData, string> = {
  clickCount: "Количество переходов",
  ip: "IP адреса последних посетителей",
};
const AnalyticsLinkForm = () => {
  const { register, handleSubmit } = useForm<FormValues>();

  const [linkData, setLinkData] = useState<LinkData | null>(null);

  const onSubmit = handleSubmit(async ({ shortUrl }) => {
    const match = shortUrl.match(/\/([^/]+)$/);
    const shortId = match ? match[1] : null;

    try {
      const result: AxiosResponse<LinkData> = await axiosInstance.get(
        `/analytics/${shortId}`,
      );

      setLinkData(result.data);
    } catch (e) {
      let errorMessage = e;
      if (e instanceof AxiosError) {
        errorMessage = e.response?.data;
      }
      toaster.create({
        title: `${errorMessage}`,
        type: "error",
      });
    }
  });
  return (
    <form onSubmit={onSubmit}>
      <Flex direction="column" gap={4}>
        <Field.Root required>
          <Field.Label>
            Сокращенная ссылка <Field.RequiredIndicator />
          </Field.Label>
          <Input
            placeholder="Вставьте сокращённую ссылку"
            variant="subtle"
            size="lg"
            {...register("shortUrl")}
          />
        </Field.Root>
        <Button size="lg" variant="subtle" colorPalette="cyan" type="submit">
          Запросить информацию
        </Button>
        {linkData && (
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Поле</Table.ColumnHeader>
                <Table.ColumnHeader>Значение</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {Object.entries(linkData).map(([key, value]) => (
                <Table.Row key={key}>
                  <Table.Cell>
                    {localesLinkDataFields[key as keyof LinkData]}
                  </Table.Cell>
                  <Table.Cell>
                    {Array.isArray(value) ? value.join(", ") : value}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </Flex>
    </form>
  );
};

export default AnalyticsLinkForm;
