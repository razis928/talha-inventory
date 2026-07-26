import { Text, View } from '@react-pdf/renderer';
import React from 'react';

import { TableRowProps } from '@/app/(financial_statements)/invoice/_components/tableRow.types';

const TableRow: React.FC<TableRowProps> = ({ data, styles }) => {
  return (
    <View style={styles.row}>
      {data.map((cell, index) => (
        <Text key={index} style={styles.cell}>
          {cell}
        </Text>
      ))}
    </View>
  );
};

export default TableRow;
