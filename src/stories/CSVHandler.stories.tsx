import type { ArgTypes, Meta, StoryObj } from "@storybook/react";
import CSVHandler from "../csv-handler/CSVHandler";
import { useState } from "react";
import { getTokenDecimalFormatters } from "../csv-handler/utils";
import { ICSVHandlerProps, IRow } from "..";

interface CSVHandlerArgTypes extends ArgTypes<ICSVHandlerProps> {
  tokenDecimal: {
    control: {
      type: string;
      min: number;
      step: number;
    };
    defaultValue: number;
  };
}

const meta: Meta<typeof CSVHandler> = {
  // title: "YourComponent/CSVHandler",
  component: CSVHandler,
  argTypes: {
    tokenDecimal: {
      control: {
        type: "number",
        min: 0,
        step: 1,
      },
      defaultValue: 18, 
    },
  } as CSVHandlerArgTypes,
};

export default meta;

type Story = StoryObj<typeof CSVHandler>;

interface CSVHandlerWrapperProps {
  tokenDecimal?: number;
  isDeletable?: boolean;
}

const CSVHandlerWrapper: React.FC<CSVHandlerWrapperProps> = ({
  tokenDecimal,
  ...args
}) => {
  const [rows, setRows] = useState<IRow[]>([]);
  const formatters = tokenDecimal ? getTokenDecimalFormatters(tokenDecimal) : undefined;

  return (
    <CSVHandler
      {...args}
      formatters={formatters}
      rows={rows}
      setRows={setRows}
    />
  );
};

export const FirstStory: Story = {
  render: (args) => <CSVHandlerWrapper {...args} />,
  args: {
    isDeletable: true,
    isEditable: true,
  },
};
