import type { Meta, StoryObj } from '@storybook/react'
import CSVHandler, { IRow } from '../csv-handler/CSVHandler'
import { useState } from 'react';

const meta: Meta<typeof CSVHandler> = {
    component: CSVHandler,
}

export default meta

type Story = StoryObj<typeof CSVHandler>;

const CSVHandlerWrapper = ({...args}) => {
    const [rows, setRows] = useState<IRow[]>([]);

    return <CSVHandler {...args} rows={rows} setRows={setRows} />
}

export const FirstStory: Story = {
    render: ({...args}) => <CSVHandlerWrapper {...args}/>,
    args: {
        isDeletable: true,
    }
}