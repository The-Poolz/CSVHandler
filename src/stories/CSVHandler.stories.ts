import type { Meta, StoryObj } from '@storybook/react'
import CSVHandler from '../csv-handler/CSVHandler'

const meta: Meta<typeof CSVHandler> = {
    component: CSVHandler,
}

export default meta

type Story = StoryObj<typeof CSVHandler>;

export const FirstStory: Story = {
    args: {
        rows: [],
        setRows: () => {},
    },
}