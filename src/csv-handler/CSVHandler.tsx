import React, { useEffect, useRef, useState } from "react";
import Papa from "papaparse";
import BigNumber from "bignumber.js";

export type BuilderStatus = "ready" | "mintingStarted" | "mintingFinished" | "mintingFailed"

export interface IRow {
  address: string;
  amount: BigNumber;
}

export interface IDataHandlerProps {
  rows: IRow[];
  setRows: React.Dispatch<React.SetStateAction<IRow[]>>;
  tokenDecimal?: number;
  isDeletable?: boolean;
}

const CSVHandler = ({
  rows,
  setRows,
//   tokenDecimal,
  isDeletable
}: IDataHandlerProps) => {
  const [dragging, setDragging] = useState<boolean>(false);
  const dragDiv = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const div = dragDiv.current;
    if (!div) return;
    div.addEventListener("dragover", handleDragOver);
    div.addEventListener("dragenter", handleDragEnter);
    div.addEventListener("dragleave", handleDragLeave);
    div.addEventListener("drop", handleDrop);
    return () => {
      div.removeEventListener("dragover", handleDragOver);
      div.removeEventListener("dragenter", handleDragEnter);
      div.removeEventListener("dragleave", handleDragLeave);
      div.removeEventListener("drop", handleDrop);
    };
  }, [])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("uploading");
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: false,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (result: Papa.ParseResult<string>) => {
        setRows([]);
        // check address here
        // if(!web3.utils.isAddress(result.data[0][0])) {
        //   result.data.shift()
        // }
        const data: IRow[] = result.data.map((data: any) => {
          return {
            address: data[0],
            amount: data[1],
          };
        });
        processData(data);
      },
    });
  };

  const handlePaste = async () => {
    const clipboardData = await navigator.clipboard.readText();
    // console.log(clipboardData)
    Papa.parse(clipboardData, {
      header: false,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (result) => {
        setRows([]);
        const data: IRow[] = result.data.map((data: any) => {
          return {
            address: data[0],
            amount: data[1],
          };
        });
        processData(data);
      },
    });
  };

  const processData = (newRows: IRow[]) => {
    console.log(newRows);
    setRows(newRows);
    const newTotalAmount = newRows.reduce(
      (acc, row) => acc.plus(row.amount),
      new BigNumber(0)
    );
    console.log(newTotalAmount.toString());
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragEnter = (event: DragEvent) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    // Access the files
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0]; // Get the first file

      Papa.parse(file, {
        header: false,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (result: Papa.ParseResult<string>) => {
          setRows([]);
        // check address here
        //   if(!web3.utils.isAddress(result.data[0][0])) {
        //     result.data.shift();
        //   }
          const data: IRow[] = result.data.map((data: any) => {
            return {
              address: data[0],
              amount: data[1],
            };
          });
          processData(data);
        },
      });
    }
  };

  return (
    <div className="mt-8 w-full mx-auto">
      <div className="text-lg">Upload Address and Amounts</div>
      <div className="flex flex-row justify-between">
        <div
          className={`border p-2 w-full h-14 relative ${
            dragging ? "bg-gray-200" : "bg-white"
          }`}
          ref={dragDiv}
        >
          {dragging ? "Drop to Upload" : "Drag and Drop or Click To Upload"}
          <input
            type="file"
            accept=".csv"
            className="absolute left-0 top-0 opacity-0 w-full h-full z-10"
            onChange={handleFileUpload}
          />
        </div>
        <button
          onClick={handlePaste}
          className="ml-2 z-10 px-4 text-white cursor-pointer bg-blue-500 rounded-lg"
        >
          Paste
        </button>
      </div>
      <div className="border mt-4 p-2 w-full h-72">
        <div className="w-full h-64 overflow-auto">
          {
            rows.map((row, index) => (
              <div
                key={`${row.address}-${row.amount.toFixed()}-${index.toString()}`}
                className={`grid grid-cols-[auto_1fr_auto_auto] gap-4 p-1 items-center ${index % 2 === 0 ? "bg-gray-100" : "bg-white"}`}
              >
                <span>{index + 1}</span>
                <span>{row.address}</span>
                <span>{row.amount.toFixed()}</span>
                {/* <span>{toHumanNumber(row.amount, tokenDecimal)}</span> */}
                {
                  isDeletable && 
                  <button
                    onClick={() => {
                      setRows((oldRows) => {
                        const newRows = [...oldRows];
                        newRows.splice(index, 1);
                        return newRows;
                      })
                    }}
                  >
                    <svg fill="none" className="w-5 h-5 hover:bg-rose-400 rounded-lg p-[0.1rem]" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                }
              </div>
            ))
          }

        </div>
        <div className="sticky flex justify-between mb-1 bottom-0 ">
          <p className="font-semibold">Total Addresses: {rows.length}</p>
          <p className="font-semibold">
            Total Amount: XXX,XXX,XXX
            {/* Total Amount: {toHumanNumber(getTotalAmountOfRows(rows), tokenDecimal)} */}
          </p>    
        </div>
      </div>
    </div>
  );
};

export default CSVHandler;
