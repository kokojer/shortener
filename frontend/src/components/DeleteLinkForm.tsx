import { Button, Field, Flex, Input } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { axiosInstance } from "@/axios.ts";
import { AxiosError } from "axios";
import { toaster } from "@/components/ui/toaster.tsx";

interface FormValues {
  shortUrl: string;
}
const DeleteLinkForm = () => {
  const { register, handleSubmit } = useForm<FormValues>();
  const onSubmit = handleSubmit(async ({ shortUrl }) => {
    const match = shortUrl.match(/\/([^/]+)$/);
    const shortId = match ? match[1] : null;

    try {
      await axiosInstance.delete(`/delete/${shortId}`);

      toaster.create({
        title: `Ссылка успешно удалена!`,
        type: "success",
      });
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
        <Button size="lg" variant="subtle" colorPalette="red" type="submit">
          Удалить
        </Button>
      </Flex>
    </form>
  );
};

export default DeleteLinkForm;
