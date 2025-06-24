import type { Meta, StoryObj } from "@storybook/react-vite";
import CSVHandler from "../csv-handler/CSVHandler";
import { useState } from "react";
import { IRow } from "..";

const meta: Meta<typeof CSVHandler> = {
  component: CSVHandler,
};

export default meta;

type Story = StoryObj<typeof CSVHandler>;

interface CSVHandlerWrapperProps {
  isDeletable?: boolean;
}

const CSVHandlerWrapper: React.FC<CSVHandlerWrapperProps> = ({...args}) => {
  const [rows, setRows] = useState<IRow[]>([]);

  return (
    <CSVHandler
      {...args}
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
