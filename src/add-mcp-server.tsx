import { Action, ActionPanel, Form, Icon, popToRoot, showToast, Toast } from "@raycast/api";
import { useState } from "react";

import {
  ADD_FORM_ARGS_PLACEHOLDER,
  ADD_FORM_COMMAND_PLACEHOLDER,
  ADD_FORM_ENV_PLACEHOLDER,
  ADD_FORM_NAME_PLACEHOLDER,
} from "./constants";
import * as locales from "./locales";
import parseArgsInput from "./utils/parseArgsInput";
import parseEnvInput from "./utils/parseEnvInput";
import writeRegistryServer from "./utils/writeRegistryServer";

interface AddServerFormValues {
  name: string;
  command: string;
  args: string;
  env: string;
}

export default function AddMcpServer() {
  const [nameError, setNameError] = useState<string>();
  const [commandError, setCommandError] = useState<string>();
  const [envError, setEnvError] = useState<string>();

  const onSubmit = async (values: AddServerFormValues) => {
    const { env, invalidLines } = parseEnvInput(values.env ?? "");

    if (invalidLines.length > 0) {
      setEnvError(`${locales.ADD_FORM_ENV_INVALID}: ${invalidLines[0]}`);

      return;
    }

    setEnvError(undefined);

    const result = writeRegistryServer({
      name: values.name ?? "",
      command: values.command ?? "",
      args: parseArgsInput(values.args ?? ""),
      env,
    });

    if (result.status === "error") {
      // NOTE: field problems are shown inline so the form can be corrected in
      // place; anything else is a servers.json problem and goes to a toast.
      if (result.field === "name") {
        setNameError(result.message);

        return;
      }

      if (result.field === "command") {
        setCommandError(result.message);

        return;
      }

      await showToast({ style: Toast.Style.Failure, title: locales.TOAST_ADD_FAILED, message: result.message });

      return;
    }

    await showToast({
      style: Toast.Style.Success,
      title: locales.TOAST_SERVER_ADDED,
      message: `${result.name} — ${locales.TOAST_PROXY_RESTART_HINT}`,
    });
    await popToRoot();
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title={locales.ADD_FORM_SUBMIT} icon={Icon.PlusCircle} onSubmit={onSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="name"
        title={locales.ADD_FORM_NAME_LABEL}
        placeholder={ADD_FORM_NAME_PLACEHOLDER}
        info={locales.ADD_FORM_NAME_INFO}
        error={nameError}
        onChange={() => setNameError(undefined)}
      />

      <Form.TextField
        id="command"
        title={locales.ADD_FORM_COMMAND_LABEL}
        placeholder={ADD_FORM_COMMAND_PLACEHOLDER}
        error={commandError}
        onChange={() => setCommandError(undefined)}
      />

      <Form.TextField
        id="args"
        title={locales.ADD_FORM_ARGS_LABEL}
        placeholder={ADD_FORM_ARGS_PLACEHOLDER}
        info={locales.ADD_FORM_ARGS_INFO}
      />

      <Form.TextArea
        id="env"
        title={locales.ADD_FORM_ENV_LABEL}
        placeholder={ADD_FORM_ENV_PLACEHOLDER}
        info={locales.ADD_FORM_ENV_INFO}
        error={envError}
        onChange={() => setEnvError(undefined)}
      />

      <Form.Description text={locales.ADD_FORM_INFO} />
    </Form>
  );
}
