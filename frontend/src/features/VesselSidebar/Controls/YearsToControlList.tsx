import { useMemo } from 'react'
import styled from 'styled-components'

import { YearControls } from './YearControls'
import { COLORS } from '../../../constants/constants'
import { Header, Zone } from '../common_styles/common.style'

import type { MissionAction } from '../../../domain/types/missionAction'

type YearsToControlListProps = {
  controlsFromDate: Date
  yearsToControls: Record<number, MissionAction.MissionAction[]>
}
export function YearsToControlList({ controlsFromDate, yearsToControls }: YearsToControlListProps) {
  const sortedYears = useMemo(
    () =>
      Object.keys(yearsToControls)
        .sort((a, b) => Number(b) - Number(a))
        .map(value => Number(value)),
    [yearsToControls]
  )

  return (
    <Zone>
      <Header>Historique des contrôles</Header>
      {yearsToControls && Object.keys(yearsToControls) && Object.keys(yearsToControls).length ? (
        <List>
          {sortedYears.map(year => (
            <YearControls key={year} year={year} yearControls={yearsToControls[year] || []} />
          ))}
        </List>
      ) : (
        <NoControls>Aucun contrôle {`depuis ${controlsFromDate.getUTCFullYear() + 1}`}</NoControls>
      )}
    </Zone>
  )
}

const List = styled.ul`
  margin: 0;
  padding: 0;
  width: 100%;
`

const NoControls = styled.div`
  text-align: center;
  padding: 10px 0 10px 0;
  color: ${COLORS.gunMetal};
  font-size: 13px;
  width: 100%;
`
