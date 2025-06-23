
# React CSV Handler Component

## Overview

React CSV Handler is a simple, reusable React component designed for handling CSV files in web applications. It allows users to upload, parse, edit, and display CSV data, specifically focusing on address and amount fields. The component supports drag-and-drop file upload, pasting from clipboard, editing individual rows, and calculating the total amount.

## Features

- **CSV File Upload:** Users can upload CSV files via drag-and-drop or by clicking to upload.
- **Clipboard Data Parsing:** Users can paste data directly from the clipboard.
- **Editable Rows:** Supports inline editing of address and amount fields in the CSV.
- **Total Amount Calculation:** Calculates and displays the total amount from the CSV data.
- **Customizability:** The component accepts various props for customization, such as decimal precision for amounts.

## Installation

To install the React CSV Handler component in your project, run:

```bash
npm install @poolzfinance/csvhandler
```
```bash
yarn add @poolzfinance/csvhandler
```
```bash
pnpm add @poolzfinance/csvhandler
```

## Usage

Import and use the `CSVHandler` component in your React application:

```javascript
import CSVHandler from '@poolzfinance/csvhandler';

const App = () => {
  // State to store the rows from the CSV file
  const [rows, setRows] = useState([]);

  return (
    <CSVHandler
      rows={rows} // Pass the rows data to the CSVHandler
      setRows={setRows} // Pass the function to update the rows
      tokenDecimal={2} // Set the decimal precision for amount fields
      isDeletable={true} // Enable the option to delete rows
      isEditable={true} // Enable the option to edit rows
    />
  );
};

export default App;
```

## Running Storybook

To view and interact with the `CSVHandler` component in a Storybook environment, run the command:

   ```bash
   pnpm run storybook
