import { Button, Clipboard, Field, Flex, Input, Link } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { addDays } from "date-fns";
import { axiosInstance } from "@/axios.ts";
import { AxiosError } from "axios";
import { toaster } from "@/components/ui/toaster.tsx";
import urlJoin from "url-join";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

interface FormValues {
  originalUrl: string;
  alias?: string | null;
  daysToExpire?: number | null;
}

const setNullEmptyStrings = (value: unknown) => (value === "" ? null : value);

const formValuesSchema = yup
  .object()
  .shape({
    originalUrl: yup
      .string()
      .max(2048, "Маскимальная длина ссылки 2048 символов!")
      .required("Обязательное поле!")
      .url("URL некорректен!"),
    alias: yup
      .string()
      .max(20, "Маскимальная длина псевдонима 20 символов!")
      .matches(
        /^[a-zA-Z0-9]+$/,
        "Псевдоним может содержать только цифры и латинские символы!",
      )
      .nullable()
      .notRequired(),
    daysToExpire: yup
      .number()
      .notRequired()
      .nullable()
      .min(1, "Минимальное значение 1!")
      .max(365, "Максимальное значение 365!"),
  })
  .required();
const ShortLinkForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { daysToExpire: null, alias: null },
    resolver: yupResolver(formValuesSchema),
  });

  const [shortedLink, setShortedLink] = useState("");

  const onSubmit = handleSubmit(
    async ({ originalUrl, alias, daysToExpire }) => {
      const expiresAt = daysToExpire
        ? addDays(new Date(), +daysToExpire).toISOString()
        : undefined;

      try {
        const result = await axiosInstance.post("/shorten", {
          originalUrl,
          alias: alias || undefined,
          expiresAt: expiresAt || undefined,
        });

        const shortId = result.data.replace(
          import.meta.env.VITE_BACKEND_URL,
          "",
        );

        setShortedLink(urlJoin(window.location.origin, shortId));
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
    },
  );
  return (
    <form onSubmit={onSubmit}>
      <Flex gap={4} direction="column">
        <Flex gap={4}>
          <Field.Root invalid={!!errors.daysToExpire}>
            <Field.Label>Дни жизни ссылки</Field.Label>
            <Input
              placeholder="Укажите количество дней жизни ссылки"
              variant="subtle"
              size="lg"
              type="number"
              {...register("daysToExpire", {
                setValueAs: setNullEmptyStrings,
              })}
            />
            <Field.ErrorText>{errors.daysToExpire?.message}</Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={!!errors.alias}>
            <Field.Label>Псевдоним ссылки</Field.Label>
            <Input
              placeholder="Укажите название для ссылки"
              variant="subtle"
              size="lg"
              {...register("alias", {
                setValueAs: setNullEmptyStrings,
              })}
            />
            <Field.ErrorText>{errors.alias?.message}</Field.ErrorText>
          </Field.Root>
        </Flex>
        <Field.Root required invalid={!!errors.originalUrl}>
          <Field.Label>
            Оригинальная ссылка <Field.RequiredIndicator />
          </Field.Label>
          <Input
            placeholder="Вставьте ссылку"
            variant="subtle"
            size="lg"
            {...register("originalUrl")}
          />
          <Field.ErrorText>{errors.originalUrl?.message}</Field.ErrorText>
        </Field.Root>
        <Button size="lg" variant="subtle" colorPalette="cyan" type="submit">
          Сократить
        </Button>
        {shortedLink && (
          <Clipboard.Root value={shortedLink}>
            <Clipboard.Trigger asChild>
              <Link as="span" color="blue.fg" textStyle="sm">
                <Clipboard.Indicator />
                <Clipboard.ValueText />
              </Link>
            </Clipboard.Trigger>
          </Clipboard.Root>
        )}
      </Flex>
    </form>
  );
};

export default ShortLinkForm;
